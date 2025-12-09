"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { cn } from "@/lib/utils";

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

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchLikes();
    fetchCommentCount();
    if (currentUserId) {
      checkIfLiked();
    }

    // Realtime subscription for likes
    const channel = supabase
      .channel(`post-stats-${post.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes", filter: `post_id=eq.${post.id}` },
        () => fetchLikes()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` },
        () => fetchCommentCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, currentUserId]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);
    setLikes(count || 0);
  };

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);
    setCommentCount(count || 0);
  };

  const checkIfLiked = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("team_id", currentUserId)
      .single();
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikes = likes;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      if (previousIsLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("team_id", currentUserId);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: post.id, team_id: currentUserId });
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      console.error("Error toggling like:", error);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-secondary">{post.teams?.name || "Unknown Team"}</span>
            {post.is_song && (
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                🎵 노래 신청
              </Badge>
            )}
            {post.is_tts && (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                🗣️ TTS
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        <div className="flex gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 hover:text-red-400 transition-colors",
              isLiked && "text-red-500 hover:text-red-600"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 hover:text-blue-400 transition-colors",
              showComments && "text-blue-500"
            )}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </Button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}
