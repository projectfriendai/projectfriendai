import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import type { Post, Comment, Notification, CommunityUser } from "../types/community";

export function usePosts(
  category?: string,
  sort: "newest" | "trending" = "newest",
  followingOnly = false,
  followedUids: string[] = []
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const constraints: any[] = [];

    if (category && category !== "All") {
      constraints.push(where("category", "==", category));
    }
    if (followingOnly && followedUids.length > 0) {
      constraints.push(where("authorId", "in", followedUids.slice(0, 10)));
    }
    constraints.push(orderBy(sort === "trending" ? "likes" : "createdAt", "desc"));
    constraints.push(limit(20));

    const q = query(collection(db, "posts"), ...constraints);
    const unsub = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
      setPosts(results);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);
    });

    return unsub;
  }, [category, sort, followingOnly, followedUids.join(",")]);

  const loadMore = useCallback(async () => {
    if (!db || !lastDoc || !hasMore) return;
    const constraints: any[] = [];
    if (category && category !== "All") {
      constraints.push(where("category", "==", category));
    }
    constraints.push(orderBy(sort === "trending" ? "likes" : "createdAt", "desc"));
    constraints.push(startAfter(lastDoc));
    constraints.push(limit(20));

    const q = query(collection(db, "posts"), ...constraints);
    const snapshot = await getDocs(q);
    const more = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
    setPosts((prev) => [...prev, ...more]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length === 20);
  }, [lastDoc, hasMore, category, sort]);

  return { posts, loading, loadMore, hasMore };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !postId) return;
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      where("parentId", "==", null),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
      setComments(results);
      setLoading(false);
    });
    return unsub;
  }, [postId]);

  return { comments, loading };
}

export function useReplies(commentId: string) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !commentId) return;
    const q = query(
      collection(db, "comments"),
      where("parentId", "==", commentId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setReplies(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)));
      setLoading(false);
    });
    return unsub;
  }, [commentId]);

  return { replies, loading };
}

export function useNotifications(uid: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!db || !uid) return;
    const q = query(
      collection(db, "notifications"),
      where("toUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(results);
      setUnreadCount(results.filter((n) => !n.read).length);
    });
    return unsub;
  }, [uid]);

  const markAllRead = useCallback(async () => {
    if (!db) return;
    for (const n of notifications) {
      if (!n.read) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
    }
  }, [notifications]);

  return { notifications, unreadCount, markAllRead };
}

export function useUserProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as CommunityUser);
      }
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { profile, loading };
}

export async function createPost(data: {
  title: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  visibility: "public" | "followers" | "private";
  link?: string;
}) {
  if (!db) throw new Error("Firebase not initialized");
  const postRef = await addDoc(collection(db, "posts"), {
    ...data,
    likes: 0,
    comments: 0,
    views: 0,
    edited: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return postRef.id;
}

export async function addComment(data: {
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
}) {
  if (!db) throw new Error("Firebase not initialized");
  const commentRef = await addDoc(collection(db, "comments"), {
    ...data,
    likes: 0,
    createdAt: serverTimestamp(),
    editedAt: null,
  });
  await updateDoc(doc(db, "posts", data.postId), {
    comments: increment(1),
  });

  const postSnap = await getDoc(doc(db, "posts", data.postId));
  const post = postSnap.data() as Post;
  if (post?.authorId !== data.authorId) {
    try {
      await addDoc(collection(db, "notifications"), {
        type: "comment",
        fromUid: data.authorId,
        fromName: data.authorName,
        fromAvatar: data.authorAvatar,
        toUid: post?.authorId,
        postId: data.postId,
        commentId: commentRef.id,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (err) {
      console.error("Failed to send comment notification:", err);
    }
  }

  return commentRef.id;
}

export async function toggleLike(postId: string, userId: string) {
  const likeRef = doc(db, "likes", `${postId}_${userId}`);
  const postRef = doc(db, "posts", postId);

  await runTransaction(db, async (tx) => {
    const [likeSnap, postSnap] = await Promise.all([
      tx.get(likeRef),
      tx.get(postRef),
    ]);

    const isActive = likeSnap.exists() && !!likeSnap.data()?.active;
    const currentLikes = postSnap.exists() ? (postSnap.data()?.likes ?? 0) : 0;

    tx.set(
      likeRef,
      { active: !isActive, userId, updatedAt: serverTimestamp() },
      { merge: true }
    );

    tx.update(postRef, {
      likes: isActive
        ? Math.max(0, currentLikes - 1)
        : currentLikes + 1,
    });
  });
}

export async function incrementViews(postId: string) {
  if (!db) return;
  try {
    await updateDoc(doc(db, "posts", postId), {
      views: increment(1),
    });
  } catch (err) {
    // silently ignore — view count is non-critical
  }
}

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  const img = await compressImage(file, 800, 0.7);
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, img);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

async function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((b) => resolve(b!), "image/webp", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}


