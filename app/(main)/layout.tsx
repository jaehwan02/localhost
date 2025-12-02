import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <AnnouncementBanner />
        <main className="flex-1 container max-w-screen-2xl py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
