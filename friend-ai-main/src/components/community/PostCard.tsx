import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Bookmark, Share2, Eye, Clock } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { Post } from "../../types/community";
import { useAuth } from "../../contexts/AuthContext";
import { toggleLike } from "../../hooks/useCommunity";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  index?: number;
}

export default function PostCard({ post, onClick, index = 0 }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.max(0, post.likes ?? 0));
  const [commentCount, setCommentCount] = useState(Math.max(0, post.comments ?? 0));
  const [bookmarked, setBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const isLikingRef = useRef(false);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "posts", post.id), (snap) => {
      if (snap.exists() && !isLikingRef.current) {
        const data = snap.data();
        setLikeCount(Math.max(0, data.likes ?? 0));
        setCommentCount(Math.max(0, data.comments ?? 0));
      }
    });
    return unsub;
  }, [post.id]);

  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "likes", `${post.id}_${user.uid}`), (snap) => {
      if (!isLikingRef.current) {
        setLiked(snap.exists() && !!snap.data()?.active);
      }
    });
    return unsub;
  }, [post.id, user?.uid]);

  const timeAgo = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    const diff = Date.now() - timestamp.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLiking) return;

    const wasLiked = liked;
    const prevCount = likeCount;

    setIsLiking(true);
    isLikingRef.current = true;
    setLiked(!wasLiked);
    setLikeCount(Math.max(0, wasLiked ? prevCount - 1 : prevCount + 1));

    try {
      await toggleLike(post.id, user.uid);
    } catch (err) {
      setLiked(wasLiked);
      setLikeCount(prevCount);
      console.error("Like failed:", err);
    } finally {
      setIsLiking(false);
      isLikingRef.current = false;
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      onClick={onClick}
      className="p-4 rounded-2xl border border-[#EDEBE7] bg-white hover:shadow-md transition-all cursor-pointer shadow-sm"
    >
      <div className="flex items-start gap-3">
        {post.authorAvatar ? (
          <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#E8F0EA] flex items-center justify-center shrink-0 text-[#7A9E85] text-xs font-black">
            {(post.authorName || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-1">
            <span className="font-medium text-[#2B2B2B]">{post.authorName}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(post.createdAt)}
            </span>
            {post.edited && <span className="text-[10px] text-[#6B6B6B]">(edited)</span>}
          </div>

          <span className="inline-block px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#7A9E85] text-[10px] font-medium mb-1.5">
            {post.category}
          </span>

          <h3 className="text-sm font-bold text-[#2B2B2B] mb-1 hover:text-[#7A9E85] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-[#4A4A4A] leading-relaxed line-clamp-3 mb-2">
            {post.content.replace(/[#*`>\[\]]/g, "").slice(0, 300)}
          </p>

          {post.image && (
            <img src={post.image} alt="" className="w-full max-h-48 object-cover rounded-xl mb-2" loading="lazy" />
          )}

          {post.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {post.tags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#6B6B6B]">#{t}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 hover:text-[#7A9E85] transition-colors cursor-pointer ${liked ? "text-[#7A9E85]" : ""}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#7A9E85]" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1 hover:text-[#7A9E85] transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </span>
            <button onClick={handleBookmark} className={`flex items-center gap-1 hover:text-[#7A9E85] transition-colors cursor-pointer ${bookmarked ? "text-[#7A9E85]" : ""}`}>
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-[#7A9E85]" : ""}`} />
            </button>
            <button onClick={handleShare} className="flex items-center gap-1 hover:text-[#7A9E85] transition-colors cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <span className="flex items-center gap-1 ml-auto">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}