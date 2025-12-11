import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuctionPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">실시간 경매</h1>
        <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
          <span className="text-xl">💰</span>
          <span className="font-bold text-secondary">1,250 코인</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Item */}
        <Card className="border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 rounded bg-error/20 text-error text-xs font-bold mb-2 animate-pulse">
                  진행 중
                </span>
                <CardTitle className="text-3xl">기계식 키보드</CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">남은 시간</p>
                <p className="text-2xl font-mono font-bold text-error">00:45</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-6xl">
              ⌨️
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">현재 입찰가</p>
                <p className="text-2xl font-bold text-primary">450 코인</p>
                <p className="text-xs text-muted-foreground">Team 3 입찰</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">시작가</p>
                <p className="text-2xl font-bold">100 코인</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1">+10</Button>
              <Button variant="outline" className="flex-1">+50</Button>
              <Button variant="outline" className="flex-1">+100</Button>
            </div>
            <div className="flex w-full gap-2">
              <Input type="number" placeholder="직접 입력" className="flex-1" />
              <Button className="flex-1 bg-primary hover:bg-primary/90">입찰하기</Button>
            </div>
          </CardFooter>
        </Card>

        {/* Auction History / Upcoming */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>입찰 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  { team: "Team 3", amount: 450, time: "10:42:15" },
                  { team: "Team 1", amount: 400, time: "10:42:05" },
                  { team: "Team 5", amount: 350, time: "10:41:50" },
                  { team: "Team 3", amount: 300, time: "10:41:30" },
                ].map((bid, i) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0">
                    <span className="font-semibold">{bid.team}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">{bid.time}</span>
                      <span className="font-mono font-bold">{bid.amount}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>다음 경매 물품</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">🎧</div>
                  <div>
                    <p className="font-medium">노이즈 캔슬링 헤드폰</p>
                    <p className="text-xs text-muted-foreground">15분 후 시작</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">🍕</div>
                  <div>
                    <p className="font-medium">피자 파티 이용권</p>
                    <p className="text-xs text-muted-foreground">45분 후 시작</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
