import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Localhost
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/community"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Community
            </Link>
            <Link
              href="/shop"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Shop
            </Link>
            <Link
              href="/auction"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Auction
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other controls here if needed */}
          </div>
          <nav className="flex items-center">
             <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
             </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
