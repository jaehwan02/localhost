import { CreatePost } from "@/components/community/CreatePost";
import { PostList } from "@/components/community/PostList";

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">커뮤니티 피드</h1>
      
      {/* Create Post Input */}
      <CreatePost />

      {/* Feed */}
      <PostList />
    </div>
  );
}
