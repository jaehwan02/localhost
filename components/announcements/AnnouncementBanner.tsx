"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const supabase = createClient();

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();

    // Realtime subscription
    const channel = supabase
      .channel("realtime-announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = (id: number) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/90 text-destructive-foreground border-destructive';
      case 'important':
        return 'bg-primary/90 text-primary-foreground border-primary';
      default:
        return 'bg-muted/90 text-foreground border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'important':
        return '📢';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`${getPriorityStyles(announcement.priority)} px-4 py-3 border-b backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between gap-4 max-w-screen-2xl mx-auto">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-xl flex-shrink-0">
                {getPriorityIcon(announcement.priority)}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">{announcement.title}</h3>
                <p className="text-sm opacity-90">{announcement.content}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0 hover:bg-background/20"
              onClick={() => handleDismiss(announcement.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
