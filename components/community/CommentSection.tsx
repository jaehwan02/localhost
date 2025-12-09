"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  team_id: string;
  teams: {
    name: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          fetchNewComment(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, teams(name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      setComments(data);
    }
  };

  const fetchNewComment = async (id: number) => {
    const { data } = await supabase
      .from("comments")
      .select("*, teams(name)")
      .eq("id", id)
      .single();

    if (data) {
      setComments((prev) => [...prev, data]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      team_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      console.error("Error adding comment:", error);
      alert("댓글 작성 실패");
    } else {
      setNewComment("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              첫 번째 댓글을 남겨보세요!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.teams?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{comment.teams?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
          등록
        </Button>
      </form>
    </div>
  );
}
