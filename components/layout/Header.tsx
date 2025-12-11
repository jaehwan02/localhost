import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold">
          Localhost
        </Link>
        <Button variant="ghost" size="sm" asChild>
            <Link href="/login">로그인</Link>
        </Button>
      </div>
    </header>
  );
}
