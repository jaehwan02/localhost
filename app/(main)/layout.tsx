import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { Suspense } from "react";

function SidebarFallback() {
  return (
    <aside className="sticky top-0 h-screen hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex-1" />
    </aside>
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur md:hidden">
      <div className="container flex h-14 items-center justify-between">
        <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      </div>
    </header>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-h-screen">
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        <AnnouncementBanner />
        <main className="flex-1 container max-w-screen-2xl py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
