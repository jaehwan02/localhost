import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">관리자 콘솔</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">사이트 보기</Link>
          </Button>
          <Button variant="destructive">로그아웃</Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">전체 팀</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 코인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,400</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">진행 중인 경매</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">대기 중인 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">5</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">팀 및 코인 관리</Button>
              <Button className="w-full" variant="outline">상점 물품 관리</Button>
              <Button className="w-full" variant="outline">새 경매 시작</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>시스템 상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>TTS 플레이어</span>
                <span className="text-success font-bold">온라인</span>
              </div>
              <div className="flex justify-between items-center">
                <span>뮤직 플레이어</span>
                <span className="text-success font-bold">재생 중</span>
              </div>
              <div className="flex justify-between items-center">
                <span>데이터베이스</span>
                <span className="text-success font-bold">연결됨</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
