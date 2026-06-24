import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
