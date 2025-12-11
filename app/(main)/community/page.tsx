import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">커뮤니티 피드</h1>
        <Button>글쓰기</Button>
      </div>

      {/* Write Post Input (Quick) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              T1
            </div>
            <Input placeholder="무슨 일이 일어나고 있나요? (TTS/신청곡 요청 가능)" />
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                T{i}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Team {i}</p>
                  <span className="text-xs text-muted-foreground">2m ago</span>
                </div>
                {i % 2 === 0 && (
                  <div className="mt-1 flex gap-2">
                    <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      🎵 노래 신청
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This is a sample post content. We are working hard on the project! 
                {i % 2 === 0 ? " Can we get some upbeat music please?" : " Anyone knows how to fix this bug?"}
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex gap-4 w-full">
                <Button variant="ghost" size="sm" className="flex-1">
                  👍 12
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  🔥 5
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  💬 3
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
