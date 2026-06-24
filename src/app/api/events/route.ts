import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID = ["VIEW", "WHATSAPP", "EMAIL"] as const;
type EventType = (typeof VALID)[number];

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, reason: "db-not-configured" });
  }

  let payload: { listingId?: string; type?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { listingId, type } = payload;
  if (!listingId || !type || !VALID.includes(type as EventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await prisma.contactEvent.create({
      data: { listingId, type: type as EventType },
    });
    if (type === "VIEW") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { viewsCount: { increment: 1 } },
      });
    }
  } catch {
    // annonce inexistante / supprimée : on ignore silencieusement
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
