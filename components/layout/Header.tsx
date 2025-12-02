import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/community" className="font-bold">
          Localhost
        </Link>
        {user ? (
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              🚪 로그아웃
            </Button>
          </form>
        ) : (
          <Button variant="default" size="sm" asChild>
            <Link href="/auth/login">🔐 로그인</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
