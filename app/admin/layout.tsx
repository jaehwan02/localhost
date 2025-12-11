import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <main className="flex-1 container max-w-screen-2xl py-6 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
