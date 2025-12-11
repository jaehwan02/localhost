import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">팀 로그인</CardTitle>
          <CardDescription>
            관리자가 제공한 팀 ID와 비밀번호를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input type="text" placeholder="팀 ID" />
          </div>
          <div className="space-y-2">
            <Input type="password" placeholder="비밀번호" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full">로그인</Button>
          <Button variant="link" className="text-xs text-muted-foreground" asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
