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
          해커톤 운영을 위한 최고의 게이미피케이션 플랫폼.
          소통하고, 경쟁하고, 분위기를 즐기세요.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">팀 로그인</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/community">게스트로 입장</Link>
        </Button>
      </div>
    </div>
  );
}
