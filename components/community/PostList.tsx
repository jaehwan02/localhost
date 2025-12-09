"use client";

import { useEffect, useState } from "react";
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
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  
  const { ref, inView } = useInView();
  const supabase = createClient();

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    checkUser();
  }, [supabase]);

  // Initial load
  useEffect(() => {
    const loadInitialPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*, teams(name)")
        .order("created_at", { ascending: false })
        .limit(POSTS_PER_PAGE);

      if (!error && data) {
        setPosts(data);
        if (data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
      }
      setLoading(false);
    };

    loadInitialPosts();
  }, [supabase]);

  // Load more when scrolling
  useEffect(() => {
    if (!inView || loading || !hasMore || posts.length === 0) return;

    const loadMore = async () => {
      setLoading(true);
      const lastPost = posts[posts.length - 1];
      
      const { data, error } = await supabase
        .from("posts")
        .select("*, teams(name)")
        .order("created_at", { ascending: false })
        .lt("created_at", lastPost.created_at)
        .limit(POSTS_PER_PAGE);

      if (!error && data) {
        // Filter duplicates
        const newPosts = data.filter(
          (newPost) => !posts.some((p) => p.id === newPost.id)
        );
        setPosts((prev) => [...prev, ...newPosts]);
        
        if (data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
      }
      setLoading(false);
    };

    loadMore();
  }, [inView]); // Only depend on inView

  // Realtime updates
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
  }, [supabase]);

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
