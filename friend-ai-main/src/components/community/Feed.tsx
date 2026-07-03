import React, { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { TrendingUp, Clock, Users, Hash, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { CATEGORIES } from "../../types/community";
import { usePosts } from "../../hooks/useCommunity";
import type { Post } from "../../types/community";
import PostCard from "./PostCard";

interface FeedProps {
  onPostClick: (post: Post) => void;
  followedUids: string[];
}

type SortMode = "newest" | "trending";
type FeedView = "home" | "trending" | "following";

export default function Feed({ onPostClick, followedUids }: FeedProps) {
  const [view, setView] = useState<FeedView>("home");
  const [sort, setSort] = useState<SortMode>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { posts, loading, loadMore, hasMore } = usePosts(
    selectedCategory === "All" ? undefined : selectedCategory,
    sort,
    view === "following",
    followedUids
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  const navItems: { id: FeedView; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "following", label: "Following", icon: Users },
  ];

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              view === item.id
                ? "bg-[#7A9E85] text-white shadow-sm"
                : "text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-[#FAF8F5]"
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
        <div className="w-px h-5 bg-[#EDEBE7] mx-1" />
        {["All", ...CATEGORIES].slice(0, 8).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#E8F0EA] text-[#7A9E85]"
                : "text-[#6B6B6B] hover:text-[#2B2B2B]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setSort("newest")}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] transition-colors cursor-pointer ${
            sort === "newest" ? "bg-[#E8F0EA] text-[#7A9E85]" : "text-[#6B6B6B] hover:text-[#2B2B2B]"
          }`}
        >
          <Clock className="w-3 h-3" />
          Newest
        </button>
        <button
          onClick={() => setSort("trending")}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] transition-colors cursor-pointer ${
            sort === "trending" ? "bg-[#E8F0EA] text-[#7A9E85]" : "text-[#6B6B6B] hover:text-[#2B2B2B]"
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          Trending
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDEBE7]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-[#EDEBE7] rounded" />
                  <div className="h-4 w-3/4 bg-[#EDEBE7] rounded" />
                  <div className="h-3 w-full bg-[#EDEBE7] rounded" />
                </div>
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
            <p className="text-xs text-[#6B6B6B]">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} index={idx} />
          ))
        )}

        {hasMore && !loading && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#7A9E85]" />
          </div>
        )}
      </div>
    </div>
  );
}