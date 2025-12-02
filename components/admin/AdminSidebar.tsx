import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function AdminSidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get admin info
  let adminInfo = null;
  if (user) {
    const { data: team } = await supabase
      .from('teams')
      .select('team_id, name, role')
      .eq('id', user.id)
      .single();
    adminInfo = team;
  }

  return (
    <aside className="sticky top-0 h-screen hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2 font-bold text-xl text-primary">
          <span>Admin Console</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-2 p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin">
            <span className="mr-2">📊</span>
            대시보드
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/teams">
            <span className="mr-2">👥</span>
            팀 관리
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/shop">
            <span className="mr-2">🛒</span>
            상점 관리
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/auction">
            <span className="mr-2">🔨</span>
            경매 관리
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/queue">
            <span className="mr-2">🎵</span>
            플레이어 관리
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/announcements">
            <span className="mr-2">📢</span>
            공지사항 관리
          </Link>
        </Button>
      </nav>
      <div className="p-4 border-t border-border space-y-3">
        {adminInfo && (
          <div className="text-sm space-y-1 mb-2">
            <p className="font-medium text-purple-600 dark:text-purple-400">
              👑 {adminInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">
              관리자
            </p>
          </div>
        )}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/community">커뮤니티로 이동</Link>
        </Button>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="destructive" className="w-full">
            로그아웃
          </Button>
        </form>
      </div>
    </aside>
  );
}
