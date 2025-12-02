import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get team info if user is logged in
  let teamInfo = null;
  if (user) {
    const { data: team } = await supabase
      .from('teams')
      .select('team_id, name, coins')
      .eq('id', user.id)
      .single();
    teamInfo = team;
  }

  return (
    <aside className="sticky top-0 h-screen hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <Link href="/community" className="flex items-center space-x-2 font-bold text-xl">
          <span>Localhost</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-2 p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/community">
            <span className="mr-2">💬</span>
            커뮤니티
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/shop">
            <span className="mr-2">🛒</span>
            상점
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/auction">
            <span className="mr-2">🔨</span>
            경매
          </Link>
        </Button>
      </nav>
      <div className="p-4 border-t border-border space-y-3">
        {user && teamInfo ? (
          <>
            <div className="text-sm space-y-1 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{teamInfo.name}</p>
              <p className="text-muted-foreground text-xs">
                💰 {teamInfo.coins.toLocaleString()} 코인
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline" className="w-full">
                🚪 로그아웃
              </Button>
            </form>
          </>
        ) : (
          <Button variant="default" className="w-full" asChild>
            <Link href="/auth/login">
              🔐 팀 로그인
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
