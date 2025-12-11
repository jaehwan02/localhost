"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  content: string;
  created_at: string;
  team_id: string;
  is_tts: boolean;
  is_song: boolean;
  teams: {
    name: string;
  };
}

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("realtime-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // Fetch the new post with team details
          fetchNewPost(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, teams(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  const fetchNewPost = async (id: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, teams(name)")
      .eq("id", id)
      .single();

    if (!error && data) {
      setPosts((prev) => [data, ...prev]);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-secondary">{post.teams?.name || "Unknown Team"}</span>
                {post.is_song && (
                  <Badge variant="outline" className="text-xs">
                    🎵 노래 신청
                  </Badge>
                )}
                {post.is_tts && (
                  <Badge variant="outline" className="text-xs">
                    🗣️ TTS
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-foreground/90 leading-relaxed">{post.content}</p>
            <div className="flex gap-4 pt-2">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <span>👍</span>
                <span>0</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary transition-colors">
                <span>🔥</span>
                <span>0</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors">
                <span>💬</span>
                <span>0</span>
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
