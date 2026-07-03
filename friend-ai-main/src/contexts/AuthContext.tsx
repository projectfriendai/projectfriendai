import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db, hasConfig } from "../firebase/config";
import type { CommunityUser } from "../types/community";

interface AuthContextValue {
  user: User | null;
  profile: CommunityUser | null;
  loading: boolean;
  firebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = hasConfig && !!auth && !!db;

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [firebaseReady]);

  const fetchProfile = async (uid: string) => {
    if (!db) return;
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setProfile(snap.data() as CommunityUser);
    }
  };

  const createUserProfile = async (firebaseUser: User, displayName?: string, username?: string) => {
    if (!db) return;
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile = {
        uid: firebaseUser.uid,
        displayName: displayName || firebaseUser.displayName || "Anonymous",
        username: username || firebaseUser.displayName?.toLowerCase().replace(/\s+/g, "_") || `user_${firebaseUser.uid.slice(0, 6)}`,
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        bio: "",
        joinedAt: serverTimestamp(),
        reputation: 0,
        followers: 0,
        following: 0,
        verified: false,
        clinicalIntakeCompleted: false,
      };
      await setDoc(userRef, newProfile);
    }
    await fetchProfile(firebaseUser.uid);
  };

  const signInWithGoogle = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserProfile(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, username: string) => {
    if (!auth || !db) return;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user, displayName, username);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!auth) return;
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        firebaseReady,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
