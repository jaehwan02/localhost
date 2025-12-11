"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MediaItem {
  id: number;
  type: "tts" | "song";
  content: string;
  status: "pending" | "playing" | "completed";
  created_at: string;
  teams: {
    name: string;
  };
}

export function PlayerControl() {
  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch queue and sort by priority (TTS > Song, then by time)
  const fetchQueue = async () => {
    const { data } = await supabase
      .from("media_queue")
      .select("*, teams(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (data) {
      // Sort: TTS first, then by created_at
      const sorted = (data as any[]).sort((a, b) => {
        if (a.type === "tts" && b.type === "song") return -1;
        if (a.type === "song" && b.type === "tts") return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      setQueue(sorted);
    }
  };

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel("admin-player")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "media_queue" },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlay) return;

    // Interrupt logic: If playing song and TTS is in queue
    if (isPlaying && currentMedia?.type === "song" && queue.some(item => item.type === "tts")) {
      stopCurrent();
      // The next effect cycle will pick up the TTS
      return;
    }

    if (!isPlaying && queue.length > 0) {
      playMedia(queue[0]);
    }
  }, [isAutoPlay, isPlaying, queue, currentMedia]);

  const stopCurrent = async () => {
    window.speechSynthesis.cancel();
    if (currentMedia) {
      // If it was a song interrupted by TTS, maybe we should keep it pending?
      // For now, let's mark it as completed to avoid infinite loops, or just reset state
      // User requirement: "TTS가 나오면 노래를 중지하고 TTS를 무조건 우선순위"
      // Let's just stop playback state. If it was interrupted, it's still in 'pending' in DB if we didn't update it yet.
      // But we update status to 'playing' when we start.
      
      // If we want to re-queue the song, we should set it back to pending.
      if (currentMedia.type === "song" && queue.some(item => item.type === "tts")) {
         await supabase.from("media_queue").update({ status: "pending" }).eq("id", currentMedia.id);
      } else {
         await supabase.from("media_queue").update({ status: "completed" }).eq("id", currentMedia.id);
      }
    }
    setIsPlaying(false);
    setCurrentMedia(null);
    fetchQueue();
  };

  const playMedia = async (item: MediaItem) => {
    setIsPlaying(true);
    setCurrentMedia(item);
    setQueue((prev) => prev.filter((i) => i.id !== item.id));

    // Update status to playing
    await supabase.from("media_queue").update({ status: "playing" }).eq("id", item.id);

    if (item.type === "tts") {
      const utterance = new SpeechSynthesisUtterance(item.content);
      utterance.lang = "ko-KR";
      
      // Safety timeout in case onend doesn't fire
      const timeoutId = setTimeout(() => {
        completeMedia(item);
      }, 5000); // 5 seconds max for short TTS

      utterance.onend = () => {
        clearTimeout(timeoutId);
        completeMedia(item);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Simulate song playback for 10 seconds (since we don't have real audio files)
      setTimeout(() => {
        completeMedia(item);
      }, 10000);
    }
  };

  const completeMedia = async (item: MediaItem) => {
    try {
      await supabase.from("media_queue").update({ status: "played" }).eq("id", item.id);
    } catch (error) {
      console.error("Error completing media:", error);
    } finally {
      setIsPlaying(false);
      setCurrentMedia(null);
      fetchQueue();
    }
  };

  const handleSkip = () => {
    if (currentMedia) {
      window.speechSynthesis.cancel();
      completeMedia(currentMedia);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">플레이어 제어</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">자동 재생</span>
            <Switch checked={isAutoPlay} onCheckedChange={setIsAutoPlay} />
          </div>
        </CardHeader>
        <CardContent>
          {currentMedia ? (
            <div className="text-center py-8 space-y-4">
              <Badge variant={currentMedia.type === "tts" ? "destructive" : "default"} className="text-lg px-4 py-1">
                {currentMedia.type === "tts" ? "TTS Playing" : "Now Playing"}
              </Badge>
              <h3 className="text-2xl font-bold">{currentMedia.content}</h3>
              <p className="text-muted-foreground">Requested by {currentMedia.teams.name}</p>
              <Button onClick={handleSkip} variant="outline">Skip</Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              대기 중...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>대기열 ({queue.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Badge variant={item.type === "tts" ? "destructive" : "secondary"}>
                    {item.type === "tts" ? "TTS" : "Song"}
                  </Badge>
                  <span className="font-medium">{item.content}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.teams.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
