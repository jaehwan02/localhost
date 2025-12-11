import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2 font-bold text-xl text-primary">
          <span>Admin Console</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
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
      </nav>
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">사이트로 돌아가기</Link>
        </Button>
      </div>
    </aside>
  );
}
