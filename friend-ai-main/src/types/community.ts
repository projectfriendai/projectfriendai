import { Timestamp } from "firebase/firestore";

export interface CommunityUser {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  joinedAt: Timestamp;
  reputation: number;
  followers: number;
  following: number;
  verified: boolean;
  bannerURL?: string;
  skills?: string[];
  website?: string;
  github?: string;
  linkedin?: string;
  location?: string;
  badges?: string[];
  achievements?: string[];
  clinicalIntakeCompleted?: boolean;
  medicalConditions?: string[];
  customMedicalHistory?: string;
  loginStreak?: number;
  lastLoginDate?: string;
  unlockedStamps?: string[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  image: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
  comments: number;
  views: number;
  edited: boolean;
  visibility: "public" | "followers" | "private";
  link?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
  editedAt: Timestamp | null;
  likes: number;
  replies?: number;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  fromUid: string;
  fromName: string;
  fromAvatar: string;
  postId?: string;
  commentId?: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Report {
  id: string;
  postId: string;
  reportedBy: string;
  reason: "spam" | "harassment" | "nsfw" | "copyright" | "fake";
  createdAt: Timestamp;
  resolved: boolean;
}

export type Category =
  | "Showcase"
  | "General"
  | "Announcements";

export const CATEGORIES: Category[] = [
  "Showcase",
  "General",
  "Announcements",
];

export type ReactionType = "like" | "love" | "fire" | "clap" | "laugh" | "wow";
