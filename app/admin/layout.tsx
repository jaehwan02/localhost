import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function AdminSidebarFallback() {
  return (
    <aside className="sticky top-0 h-screen hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex-1" />
    </aside>
  );
}

function AdminLayoutFallback() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebarFallback />
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <main className="flex-1 container max-w-screen-2xl py-6 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </main>
      </div>
    </div>
  );
}

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify user has admin role
  const { data: team } = await supabase
    .from('teams')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!team || team.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<AdminSidebarFallback />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <main className="flex-1 container max-w-screen-2xl py-6 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
