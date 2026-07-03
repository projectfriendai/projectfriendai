import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Home, TrendingUp, Users, Bookmark, Bell, User, Settings, Shield,
  Plus, Search, Hash, Loader2, Heart, MessageCircle, Eye, ArrowLeft, Sparkles
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useComments, useNotifications, toggleLike, incrementViews } from "../../hooks/useCommunity";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { Post } from "../../types/community";
import Feed from "./Feed";
import Comments from "./Comments";
import CreatePost from "./CreatePost";
import { CATEGORIES } from "../../types/community";

type CommunityView = "home" | "trending" | "following" | "bookmarks" | "notifications" | "profile" | "settings" | "guidelines";

export default function CommunityPage({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const { user, profile, firebaseReady, loading: authLoading } = useAuth();
  const [view, setView] = useState<CommunityView>("home");
  const [showAuth, setShowAuth] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { notifications, unreadCount } = useNotifications(user?.uid || "");

  if (!firebaseReady) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <Shield className="w-12 h-12 text-[#6B6B6B] mb-3" />
        <h3 className="text-sm font-bold text-[#2B2B2B] mb-1">Firebase Not Configured</h3>
        <p className="text-xs text-[#6B6B6B] max-w-md">
          Set <code className="text-[#7A9E85]">VITE_FIREBASE_*</code> environment variables to enable the community platform.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#7A9E85]" />
      </div>
    );
  }

  const sidebarItems: { id: CommunityView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "following", label: "Following", icon: Users },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "guidelines", label: "Guidelines", icon: Shield },
  ];

  return (
    <div className="flex-1 flex h-full overflow-hidden font-sans bg-[#FAF8F5]">
      <CreatePost isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />

      <div className="w-48 shrink-0 border-r border-[#EDEBE7] p-3 space-y-1 overflow-y-auto hidden md:block bg-white">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#6B6B6B] px-2 pb-2 border-b border-[#EDEBE7] mb-2">Community</div>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              view === item.id
                ? "bg-[#E8F0EA] text-[#7A9E85] border border-[#7A9E85]/20"
                : "text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-[#FAF8F5]"
            }`}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge ? <span className="px-1.5 py-0.5 rounded-full bg-[#7A9E85] text-white text-[9px] font-bold">{item.badge}</span> : null}
          </button>
        ))}
        <div className="pt-3 mt-3 border-t border-[#EDEBE7] space-y-2">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#6B6B6B] px-2">Categories</div>
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button key={cat} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10px] text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-[#FAF8F5] transition-colors cursor-pointer">
              <Hash className="w-3 h-3" />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b border-[#EDEBE7] bg-white">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6B6B]" />
            <input type="text" placeholder="Search posts, users, tags..." className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-xs placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#7A9E85]" />
          </div>
          {user ? (
            <button onClick={() => setShowCreatePost(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7A9E85] hover:bg-[#6B9080] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          ) : (
            <button onClick={() => onOpenAuth ? onOpenAuth() : setShowAuth(true)} className="px-3 py-1.5 rounded-xl bg-[#7A9E85] hover:bg-[#6B9080] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm">
              Sign In
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {selectedPost ? (
            <PostDetailView post={selectedPost} onBack={() => setSelectedPost(null)} />
          ) : view === "home" || view === "trending" || view === "following" ? (
            <Feed onPostClick={(post) => setSelectedPost(post)} followedUids={[]} />
          ) : view === "notifications" ? (
            <NotificationsView notifications={notifications} />
          ) : view === "bookmarks" ? (
            <div className="text-center py-12"><Bookmark className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" /><p className="text-xs text-[#6B6B6B]">Your bookmarked posts will appear here.</p></div>
          ) : view === "profile" ? (
            <ProfileView profile={profile} />
          ) : view === "guidelines" ? (
            <GuidelinesView />
          ) : view === "settings" ? (
            <SettingsView />
          ) : null}
        </div>
      </div>      
    </div>
  );
}

function PostDetailView({ post, onBack }: { post: Post; onBack: () => void }) {
  const { user } = useAuth();
  const { comments, loading } = useComments(post.id);
  const [livePost, setLivePost] = useState(post);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "posts", post.id), (snap) => {
      if (snap.exists()) {
        setLivePost({ id: snap.id, ...snap.data() } as Post);
      }
    });
    return unsub;
  }, [post.id]);

  useEffect(() => {
    if (!db || !user) return;
    const unsub = onSnapshot(doc(db, "likes", `${post.id}_${user.uid}`), (snap) => {
      if (snap.exists()) {
        setLiked(!!snap.data().active);
      } else {
        setLiked(false);
      }
    });
    return unsub;
  }, [post.id, user?.uid]);

  useEffect(() => {
    incrementViews(post.id);
  }, [post.id]);

  const handleLike = async () => {
    if (!user) return;
    await toggleLike(post.id, user.uid);
  };

  const commentCount = livePost.comments ?? comments.length;

  const timeAgo = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    const diff = Date.now() - timestamp.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to feed
      </button>
      <div className="p-4 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#E8F0EA] flex items-center justify-center shrink-0 text-[#7A9E85] text-[10px] font-black">
              {(post.authorName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-xs">
            <div className="font-medium text-[#2B2B2B]">{post.authorName}</div>
            <div className="text-[10px] text-[#6B6B6B]">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <span className="inline-block px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#7A9E85] text-[10px] font-medium mb-2">{post.category}</span>
        <h2 className="text-base font-bold text-[#2B2B2B] mb-2">{post.title}</h2>
        <div className="text-xs text-[#4A4A4A] leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</div>
        {post.image && <img src={post.image} alt="" className="w-full max-h-64 object-cover rounded-xl mb-3" />}
        {post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {post.tags.map((t) => <span key={t} className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#6B6B6B]">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-[#6B6B6B] border-t border-[#EDEBE7] pt-3">
          <button onClick={handleLike} className={`flex items-center gap-1 hover:text-[#7A9E85] transition-colors cursor-pointer ${liked ? "text-[#7A9E85]" : ""}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#7A9E85]" : ""}`} />
            {livePost.likes}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {commentCount}
          </span>
          <span className="flex items-center gap-1 ml-auto"><Eye className="w-3.5 h-3.5" />{livePost.views}</span>
        </div>
      </div>
      <div className="p-4 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm">
        <h3 className="text-xs font-bold text-[#2B2B2B] mb-3 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-[#7A9E85]" />
          Comments ({commentCount})
        </h3>
        <Comments postId={post.id} comments={comments} loading={loading} onRefresh={() => {}} />
      </div>
    </div>
  );
}

function NotificationsView({ notifications }: { notifications: any[] }) {
  if (notifications.length === 0) {
    return <div className="text-center py-12"><Bell className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" /><p className="text-xs text-[#6B6B6B]">No notifications yet.</p></div>;
  }
  return (
    <div className="max-w-xl mx-auto space-y-2">
      {notifications.map((n: any) => (
        <div key={n.id} className={`p-3 rounded-2xl border bg-white shadow-sm ${n.read ? "border-[#EDEBE7]" : "border-[#7A9E85]/30 bg-[#E8F0EA]"} flex items-start gap-3`}>
          {n.fromAvatar ? (
            <img src={n.fromAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#E8F0EA] flex items-center justify-center shrink-0 text-[#7A9E85] text-[10px] font-black">
              {(n.fromName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-xs text-[#4A4A4A]">
            <span className="font-medium text-[#2B2B2B]">{n.fromName}</span>{" "}
            {n.type === "like" ? "liked your post" : n.type === "comment" ? "commented on your post" : n.type === "follow" ? "followed you" : "mentioned you"}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileView({ profile }: { profile: any }) {
  if (!profile) {
    return <div className="text-center py-12"><User className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" /><p className="text-xs text-[#6B6B6B]">Sign in to view your profile.</p></div>;
  }
  const initial = (profile.displayName || profile.username || "U").charAt(0).toUpperCase();
  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      {profile.photoURL ? (
        <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#7A9E85]/30" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#E8F0EA] flex items-center justify-center mx-auto border-2 border-[#7A9E85]/30 text-[#7A9E85] text-xl font-black">
          {initial}
        </div>
      )}
      <div>
        <h2 className="text-sm font-bold text-[#2B2B2B]">{profile.displayName}</h2>
        <p className="text-[10px] text-[#6B6B6B]">@{profile.username}</p>
        <p className="text-xs text-[#6B6B6B] mt-1 max-w-md mx-auto">{profile.bio || "No bio yet."}</p>
      </div>
      <div className="flex justify-center gap-6 text-xs text-[#6B6B6B]">
        <div><span className="font-bold text-[#2B2B2B]">{profile.followers || 0}</span><span className="ml-1">Followers</span></div>
        <div><span className="font-bold text-[#2B2B2B]">{profile.following || 0}</span><span className="ml-1">Following</span></div>
        <div><span className="font-bold text-[#2B2B2B]">{profile.reputation || 0}</span><span className="ml-1">Rep</span></div>
      </div>
    </div>
  );
}

function GuidelinesView() {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-base font-bold text-[#2B2B2B]">Community Guidelines</h2>
      <div className="space-y-3 text-xs text-[#4A4A4A] leading-relaxed">
        <p>Welcome to the Friend AI Community! Our goal is to create a safe, supportive space for discussing AI, mental health, technology, and personal growth.</p>
        <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm space-y-2">
          <p className="font-medium text-[#2B2B2B]">1. Be Respectful</p>
          <p>Treat everyone with kindness and empathy. Harassment, hate speech, and bullying will not be tolerated.</p>
        </div>
        <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm space-y-2">
          <p className="font-medium text-[#2B2B2B]">2. Stay On Topic</p>
          <p>Keep discussions relevant to the category. Use appropriate tags for better discovery.</p>
        </div>
        <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm space-y-2">
          <p className="font-medium text-[#2B2B2B]">3. No Spam</p>
          <p>Do not post spam, self-promotion, or irrelevant links. Quality over quantity.</p>
        </div>
        <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm space-y-2">
          <p className="font-medium text-[#2B2B2B]">4. Privacy First</p>
          <p>Do not share personal information about yourself or others. Stay safe online.</p>
        </div>
        <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm space-y-2">
          <p className="font-medium text-[#2B2B2B]">5. Report Issues</p>
          <p>Use the report feature to flag inappropriate content. Our moderation team will review promptly.</p>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-base font-bold text-[#2B2B2B]">Community Settings</h2>
      <div className="p-3 rounded-2xl border border-[#EDEBE7] bg-white shadow-sm">
        <label className="block text-xs font-medium text-[#2B2B2B] mb-2">Community settings will be available soon.</label>
        <p className="text-[10px] text-[#6B6B6B]">Notification preferences, content filters, and account management coming in the next update.</p>
      </div>
    </div>
  );
}