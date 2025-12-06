"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Volume2 } from "lucide-react";

interface SlashCommand {
  label: string;
  value: "tts" | "song";
  icon: React.ReactNode;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    label: "TTS",
    value: "tts",
    icon: <Volume2 className="h-4 w-4" />,
    description: "텍스트를 음성으로 변환",
  },
  {
    label: "SONG",
    value: "song",
    icon: <Music className="h-4 w-4" />,
    description: "노래 신청",
  },
];

export function CreatePost() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<"tts" | "song" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Detect slash command
  useEffect(() => {
    const lastChar = content[content.length - 1];
    const isSlashAtEnd = lastChar === "/" && (content.length === 1 || content[content.length - 2] === " ");
    
    setShowCommands(isSlashAtEnd);
    if (isSlashAtEnd) {
      setSelectedIndex(0);
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCommands) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % SLASH_COMMANDS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + SLASH_COMMANDS.length) % SLASH_COMMANDS.length);
    } else if (e.key === "Enter" && showCommands) {
      e.preventDefault();
      selectCommand(SLASH_COMMANDS[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowCommands(false);
    }
  };

  const selectCommand = (command: SlashCommand) => {
    // Remove the trailing slash and add the command
    const newContent = content.slice(0, -1) + `/${command.label} `;
    setContent(newContent);
    setSelectedCommand(command.value);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Validate YouTube URL for SONG command
    if (selectedCommand === "song" || content.includes("/SONG")) {
      const cleanContent = content
        .replace(/\/SONG\s*/g, "")
        .trim();
      
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      
      if (!youtubeRegex.test(cleanContent)) {
        alert("노래 신청은 YouTube 링크만 가능합니다.\n예: https://youtube.com/watch?v=...");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if team exists for this user
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
            coins: 1000,
          });
        
        if (createError) throw createError;
      }

      // Determine flags based on selected command or content
      const isTTS = selectedCommand === "tts" || content.includes("/TTS");
      const isSong = selectedCommand === "song" || content.includes("/SONG");

      // Remove slash commands from content before saving
      const cleanContent = content
        .replace(/\/TTS\s*/g, "")
        .replace(/\/SONG\s*/g, "")
        .trim();

      const { error } = await supabase.from("posts").insert({
        team_id: user.id,
        content: cleanContent,
        is_tts: isTTS,
        is_song: isSong,
      });

      if (error) throw error;

      // If it's a TTS or SONG request, also add to media queue
      if (isTTS || isSong) {
        const { error: queueError } = await supabase.from("media_queue").insert({
          team_id: user.id,
          type: isTTS ? "tts" : "song",
          content: cleanContent,
          status: "pending",
        });

        if (queueError) {
          console.error("Error adding to media queue:", queueError);
          // Don't throw - post was created successfully, queue is secondary
        }
      }

      setContent("");
      setSelectedCommand(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative z-50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 relative">
              <span className="font-bold text-primary whitespace-nowrap">T1</span>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="무슨 일이 일어나고 있나요? (/ 를 입력하여 명령어 보기)"
                  className="bg-background/50 border-none focus-visible:ring-1"
                />
                
                {/* Slash Command Dropdown */}
                {showCommands && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-[100] overflow-hidden">
                    {SLASH_COMMANDS.map((command, index) => (
                      <button
                        key={command.value}
                        type="button"
                        onClick={() => selectCommand(command)}
                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors ${
                          index === selectedIndex ? "bg-accent" : ""
                        }`}
                      >
                        <div className="text-muted-foreground">{command.icon}</div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm">/{command.label}</div>
                          <div className="text-xs text-muted-foreground">{command.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "작성 중..." : "게시"}
            </Button>
          </div>
          
          {/* Selected Command Badge */}
          {selectedCommand && (
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                {selectedCommand === "tts" ? <Volume2 className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                {selectedCommand === "tts" ? "TTS" : "노래 신청"}
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
