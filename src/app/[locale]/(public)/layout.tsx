import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { CookieNotice } from "@/components/layout/cookie-notice";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>
      <PublicHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieNotice />
    </div>
  );
}
