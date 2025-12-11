"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MediaItem {
  id: number;
  type: "tts" | "song";
  content: string;
  status: string;
  created_at: string;
  teams: {
    name: string;
  };
}

interface MediaQueueProps {
  queue: MediaItem[];
}

export function MediaQueue({ queue }: MediaQueueProps) {
  const currentItem = queue[0];
  const upcomingItems = queue.slice(1);

  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
      {/* Now Playing */}
      <Card className="border-primary/50 bg-card/50 backdrop-blur-sm h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Now Playing
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-6">
          {currentItem ? (
            <>
              <div className="text-6xl animate-bounce">
                {currentItem.type === "song" ? "🎵" : "🗣️"}
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {currentItem.teams?.name || "Unknown Team"}
                </Badge>
                <h2 className="text-3xl font-bold leading-tight">
                  {currentItem.content}
                </h2>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">💤</div>
              <p>대기 중인 요청이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue List */}
      <Card className="bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>대기열 ({upcomingItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl">
                    {item.type === "song" ? "🎵" : "🗣️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.teams?.name || "Unknown Team"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                대기 중인 항목이 없습니다.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
