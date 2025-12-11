"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if team exists for this user, if not create one (for testing)
      // In production, teams should be pre-created by admin
      const { data: team } = await supabase
        .from("teams")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!team) {
        // Auto-create team profile for the test user
        const { error: createError } = await supabase
          .from("teams")
          .insert({
            id: user.id,
            team_id: user.email?.split("@")[0] || "unknown",
            name: user.email?.split("@")[0] || "Unknown Team",
            coins: 1000 // Give some initial coins
          });
        
        if (createError) throw createError;
      }

      const { error } = await supabase.from("posts").insert({
        team_id: user.id,
        content: content,
        is_tts: false, // Default for now
        is_song: false, // Default for now
      });

      if (error) throw error;

      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 flex items-center gap-2">
            <span className="font-bold text-primary whitespace-nowrap">T1</span>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="무슨 일이 일어나고 있나요? (TTS/신청곡 요청 가능)"
              className="bg-background/50 border-none focus-visible:ring-1"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "작성 중..." : "게시"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
