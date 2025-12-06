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

// Declare YouTube types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function PlayerControl() {
  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const supabase = createClient();
  const youtubePlayerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

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
      return;
    }

    if (!isPlaying && queue.length > 0) {
      playMedia(queue[0]);
    }
  }, [isAutoPlay, isPlaying, queue, currentMedia]);

  const stopCurrent = async () => {
    window.speechSynthesis.cancel();
    
    // Stop YouTube player if playing
    if (youtubePlayerRef.current && currentMedia?.type === "song") {
      youtubePlayerRef.current.stopVideo();
    }

    if (currentMedia) {
      if (currentMedia.type === "song" && queue.some(item => item.type === "tts")) {
         await supabase.from("media_queue").update({ status: "pending" }).eq("id", currentMedia.id);
      } else {
         await supabase.from("media_queue").update({ status: "played" }).eq("id", currentMedia.id);
      }
    }
    setIsPlaying(false);
    setCurrentMedia(null);
    fetchQueue();
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
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
      
      const timeoutId = setTimeout(() => {
        completeMedia(item);
      }, 5000);

      utterance.onend = () => {
        clearTimeout(timeoutId);
        completeMedia(item);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Play YouTube video
      const videoId = extractYouTubeVideoId(item.content);
      
      if (!videoId) {
        console.error("Invalid YouTube URL:", item.content);
        completeMedia(item);
        return;
      }

      // Timeout fallback - if video doesn't start within 10 seconds, skip it
      const timeoutId = setTimeout(() => {
        console.log("YouTube video timeout - skipping");
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
        }
        completeMedia(item);
      }, 10000);

      // Wait for YouTube API to be ready
      const initPlayer = () => {
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
        }

        youtubePlayerRef.current = new window.YT.Player(playerDivRef.current, {
          height: "360",
          width: "640",
          videoId: videoId,
          playerVars: {
            autoplay: 1,
          },
          events: {
            onReady: () => {
              // Video loaded successfully, clear the timeout
              clearTimeout(timeoutId);
            },
            onStateChange: (event: any) => {
              // 0 = ended
              if (event.data === 0) {
                clearTimeout(timeoutId);
                completeMedia(item);
              }
            },
            onError: (event: any) => {
              // Video unavailable, skip it
              console.error("YouTube player error:", event.data);
              clearTimeout(timeoutId);
              completeMedia(item);
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }
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
      if (youtubePlayerRef.current && currentMedia.type === "song") {
        youtubePlayerRef.current.stopVideo();
      }
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
              
              {currentMedia.type === "song" ? (
                <div className="flex justify-center">
                  <div ref={playerDivRef} className="rounded-lg overflow-hidden" />
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">{currentMedia.content}</h3>
                  <p className="text-muted-foreground">Requested by {currentMedia.teams.name}</p>
                </>
              )}
              
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
                  <span className="font-medium truncate max-w-md">{item.content}</span>
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
