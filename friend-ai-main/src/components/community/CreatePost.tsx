import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image, Link, Globe, Lock, Users, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createPost, uploadImage } from "../../hooks/useCommunity";
import { CATEGORIES } from "../../types/community";
import { db } from "../../firebase/config";


interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [link, setLink] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile || !db) return;
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image, `posts/${user.uid}/${Date.now()}`);
      }

      await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        image: imageUrl,
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: profile.photoURL,
        visibility,
        link: link.trim() || undefined,
      });

      setTitle("");
      setContent("");
      setCategory("General");
      setTags([]);
      setImage(null);
      setImagePreview("");
      setLink("");
      setVisibility("public");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const charCount = content.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#EDEBE7] p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2B2B2B]">Create Post</h2>
              <button onClick={onClose} className="p-1.5 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F5E6E0] border border-[#EDEBE7] text-[#4A4A4A] text-xs">{error}</div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-base font-bold placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#7A9E85] transition-colors"
              />

              <textarea
                placeholder="What's on your mind? (Markdown supported)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-sm placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#7A9E85] transition-colors resize-none"
              />
              <div className="text-right text-[10px] text-[#6B6B6B]">{charCount} characters</div>

              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-sm focus:outline-none focus:border-[#7A9E85]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-sm focus:outline-none focus:border-[#7A9E85]"
                >
                  <option value="public"><Globe className="w-3 h-3 inline" /> Public</option>
                  <option value="followers"><Users className="w-3 h-3 inline" /> Followers</option>
                  <option value="private"><Lock className="w-3 h-3 inline" /> Private</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 flex gap-1 flex-wrap">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#7A9E85] text-[10px] font-medium">
                      #{t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-[#2B2B2B] cursor-pointer">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-xs placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#7A9E85]"
                />
                <button onClick={addTag} className="px-3 py-1.5 rounded-xl bg-[#7A9E85] text-white text-xs font-bold hover:bg-[#6B9080] transition-colors cursor-pointer shadow-sm">Add</button>
              </div>

              <input
                type="text"
                placeholder="Optional link..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEBE7] bg-[#FAF8F5] text-[#2B2B2B] text-xs placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#7A9E85]"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert("Image uploads are currently disabled because Firebase Storage is not enabled for this project. Use Option A (upgrade to the Blaze plan in Firebase Console) to enable this feature.")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDEBE7] text-[#6B6B6B] text-xs cursor-not-allowed opacity-60 hover:bg-[#FAF8F5] transition-colors"
                  title="Image uploads are disabled (requires Firebase Storage)"
                >
                  <Image className="w-3.5 h-3.5" />
                  Add Image (Disabled)
                </button>
                <span className="text-[10px] text-[#6B6B6B] font-medium">Requires Firebase Storage (Blaze plan)</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#EDEBE7] pt-4">
              <div className="flex gap-2">
                <Globe className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span className="text-[10px] text-[#6B6B6B]">{visibility === "public" ? "Visible to everyone" : visibility === "followers" ? "Visible to followers" : "Only you"}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={uploading || !title.trim() || !content.trim()}
                className="px-5 py-2 rounded-xl bg-[#7A9E85] hover:bg-[#6B9080] text-white text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}