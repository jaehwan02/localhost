"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";

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

const POSTS_PER_PAGE = 10;

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  
  const { ref, inView } = useInView();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id);
  };

  const fetchPosts = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    
    setLoading(true);
    
    // Calculate range
    const from = isInitial ? 0 : posts.length;
    const to = from + POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("posts")
      .select("*, teams(name)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
      
      setPosts((prev) => isInitial ? data : [...prev, ...data]);
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  }, [posts.length, hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView) {
      fetchPosts();
    }
  }, [inView, fetchPosts]);

  // Realtime updates for new posts
  useEffect(() => {
    const channel = supabase
      .channel("realtime-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          // Fetch the new post with team details
          const { data } = await supabase
            .from("posts")
            .select("*, teams(name)")
            .eq("id", payload.new.id)
            .single();
            
          if (data) {
            setPosts((prev) => [data, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
      
      {/* Loading indicator / Sentinel */}
      <div ref={ref} className="flex justify-center py-4">
        {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-muted-foreground">모든 게시글을 불러왔습니다.</p>
        )}
      </div>
    </div>
  );
}
