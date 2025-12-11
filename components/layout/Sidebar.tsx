import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card/50 md:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <span>Localhost</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
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
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">팀 로그인</Link>
        </Button>
      </div>
    </aside>
  );
}
