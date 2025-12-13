import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Localhost
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          The ultimate gamified platform for hackathon operations.
          Connect, compete, and enjoy the vibe.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Team Login</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/community">Enter as Guest</Link>
        </Button>
      </div>
    </div>
  );
}
