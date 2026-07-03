import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock, Check, Loader2, ArrowRight, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export interface LoginData {
  alias: string;
  passcode: string;
  location: string;
  medicalConditions: string[];
  customMedicalHistory: string;
  consentPsychology: boolean;
  consentAnonymity: boolean;
}

interface AliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: LoginData) => void;
  error?: string | null;
  initialTab?: "login" | "signup";
}

const getFriendlyErrorMessage = (err: any): string => {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
      return "Incorrect email or password, or this account does not exist. Please check your credentials or click 'Create an account' to register.";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or sign up to create an account.";
    case "auth/wrong-password":
      return "Incorrect password. If you forgot your password, enter your email and click 'Forgot password?'.";
    case "auth/email-already-in-use":
      return "This email address is already registered. Please go to the 'Sign In' screen to log in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before completion. Please try again.";
    default:
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      return msg.replace(/^Firebase:\s*/i, "");
  }
};

export function AliasModal({ isOpen, onClose, onLogin, error: externalError, initialTab = "signup" }: AliasModalProps) {
  const { user, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading: authLoading } = useAuth();

  const [emailTab, setEmailTab] = useState<"signup" | "login">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const [location, setLocation] = useState("India");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [customMedicalHistory, setCustomMedicalHistory] = useState("");
  const [consentPsychology, setConsentPsychology] = useState(false);
  const [consentAnonymity, setConsentAnonymity] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    setEmailTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setErrorState(null);
    setResetSent(false);
  }, [emailTab]);

  useEffect(() => {
    if (user && profile) {
      if (profile.clinicalIntakeCompleted) {
        onLogin({
          alias: profile.displayName || user.displayName || "Anonymous",
          passcode: "",
          location: profile.location || "India",
          medicalConditions: (profile as any).medicalConditions || [],
          customMedicalHistory: (profile as any).customMedicalHistory || "",
          consentPsychology: true,
          consentAnonymity: true
        });
        onClose();
      } else {
        setEmailTab("signup");
        if (!displayName) {
          setDisplayName(profile.displayName || user.displayName || "");
        }
        if (!username) {
          setUsername(profile.username || user.displayName?.toLowerCase().replace(/\s+/g, "_") || "");
        }
      }
    }
  }, [user, profile]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorState(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorState(getFriendlyErrorMessage(err));
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorState("Please enter your email address first.");
      return;
    }
    setErrorState(null);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorState(getFriendlyErrorMessage(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    setSubmitting(true);

    try {
      if (!user) {
        if (emailTab === "signup") {
          if (!displayName.trim() || !username.trim()) {
            throw new Error("Display name and username are required");
          }
          if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long.");
          }
          if (!/[A-Z]/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter.");
          }
          if (!/[a-z]/.test(password)) {
            throw new Error("Password must contain at least one lowercase letter.");
          }
          if (!/[0-9]/.test(password)) {
            throw new Error("Password must contain at least one number.");
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new Error("Password must contain at least one special character.");
          }
          if (!consentPsychology || !consentAnonymity) {
            throw new Error("You must accept both safety agreements to proceed.");
          }

          await signUpWithEmail(email, password, displayName.trim(), username.trim());

          const currentUser = auth?.currentUser;
          if (currentUser && db) {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
              location,
              medicalConditions,
              customMedicalHistory,
              consentPsychology,
              consentAnonymity,
              clinicalIntakeCompleted: true
            });
            onLogin({
              alias: displayName.trim(),
              passcode: "",
              location,
              medicalConditions,
              customMedicalHistory,
              consentPsychology,
              consentAnonymity
            });
          }
          onClose();
        } else {
          await signInWithEmail(email, password);
          onClose();
        }
      } else {
        if (!displayName.trim() || !username.trim()) {
          throw new Error("Display name and username are required");
        }
        if (!consentPsychology || !consentAnonymity) {
          throw new Error("You must accept both safety agreements to proceed.");
        }

        if (db) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            displayName: displayName.trim(),
            username: username.trim(),
            location,
            medicalConditions,
            customMedicalHistory,
            consentPsychology,
            consentAnonymity,
            clinicalIntakeCompleted: true
          });
          onLogin({
            alias: displayName.trim(),
            passcode: "",
            location,
            medicalConditions,
            customMedicalHistory,
            consentPsychology,
            consentAnonymity
          });
        }
        onClose();
      }
    } catch (err: any) {
      setErrorState(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const activeError = errorState || externalError;

  const renderLoginScreen = () => (
    <div className="relative w-full max-w-md bg-white border border-[#EDEBE7] rounded-2xl shadow-lg p-8 my-8 overflow-hidden font-sans">
      <button onClick={onClose} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors z-20">
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#2B2B2B] tracking-tight">Welcome back</h2>
          <p className="text-sm text-[#6B6B6B] mt-2">
            New here?{" "}
            <button
              type="button"
              onClick={() => setEmailTab("signup")}
              className="text-[#7A9E85] hover:text-[#6B9080] font-semibold transition-colors"
            >
              Create an account →
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={authLoading || submitting}
          className="w-full py-3 bg-transparent border border-[#EDEBE7] hover:border-[#7A9E85]/30 disabled:opacity-50 text-[#2B2B2B] font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.44-2.885-6.44-6.44s2.885-6.44 6.44-6.44c1.633 0 3.129.61 4.27 1.621l3.03-3.03C19.07 2.38 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.236 0 11.265-5.029 11.265-11.24 0-.78-.069-1.536-.205-2.255H12.24z" fill="#2B2B2B"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#EDEBE7]"></div>
          <span className="px-4 text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">or sign in with email</span>
          <div className="flex-1 h-px bg-[#EDEBE7]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-sm p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
          />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-sm p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
            />
            <div className="text-right mt-1.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-[#6B6B6B] hover:text-[#7A9E85] transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {resetSent && (
            <div className="p-3 bg-[#E8F0EA] border border-[#7A9E85]/30 rounded-xl text-xs text-[#2B2B2B]">
              Password reset email sent. Check your inbox.
            </div>
          )}

          {activeError && (
            <div className="p-3.5 bg-[#FDE8E8] border border-[#FCA5A5]/50 rounded-xl text-xs text-[#991B1B] flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{activeError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#7A9E85] hover:bg-[#6B9080] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-[#6B6B6B] mt-6">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setEmailTab("signup")}
            className="text-[#7A9E85] hover:text-[#6B9080] font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );

  const renderSignupScreen = () => (
    <div className="relative w-full max-w-xl bg-white border border-[#EDEBE7] rounded-2xl shadow-lg p-6 md:p-8 my-8 overflow-hidden font-sans">

      <button onClick={onClose} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors z-20">
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="flex flex-col mb-6">
          <span className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em] font-bold block mb-1">
            Friend AI
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[#2B2B2B] mb-2">
            Verification
          </h2>
          <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed">
            Establish your identity and clinical parameters before entering.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!user && (
            <div className="space-y-3">
              <span className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-bold block flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#6B6B6B]" />
                Sign In with Google
              </span>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading || submitting}
                className="w-full py-3 bg-[#FAF8F5] border border-[#EDEBE7] hover:bg-[#E8F0EA] disabled:opacity-50 text-[#2B2B2B] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <svg className="w-4 h-4 fill-current shrink-0 text-[#2B2B2B]" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.44-2.885-6.44-6.44s2.885-6.44 6.44-6.44c1.633 0 3.129.61 4.27 1.621l3.03-3.03C19.07 2.38 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.236 0 11.265-5.029 11.265-11.24 0-.78-.069-1.536-.205-2.255H12.24z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center pt-2">
                <div className="flex-1 h-px bg-[#EDEBE7]"></div>
                <span className="px-3 text-[10px] uppercase font-mono tracking-widest text-[#6B6B6B]">
                  or register with email
                </span>
                <div className="flex-1 h-px bg-[#EDEBE7]"></div>
              </div>
            </div>
          )}

          {user && (
            <div className="p-3.5 bg-[#E8F0EA] border border-[#7A9E85]/20 rounded-2xl text-xs text-[#2B2B2B] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#7A9E85] shrink-0" />
              <span>Authenticated as <strong>{user.email}</strong>. Complete your registration below.</span>
            </div>
          )}

          {!user && (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
              />
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
                />
              </div>
            </div>
          )}

          {user && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#6B6B6B] uppercase tracking-wider font-bold">Display Name</span>
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#6B6B6B] uppercase tracking-wider font-bold">Username</span>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all placeholder-[#6B6B6B]"
                />
              </div>
            </div>
          )}

          <div className="h-px w-full bg-[#EDEBE7]"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2B2B2B] tracking-wide">
                Clinical intake history
              </h3>
              <span className="bg-[#E8F0EA] text-[#7A9E85] border border-[#7A9E85]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Securely stored
              </span>
            </div>

            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EDEBE7] hover:border-[#7A9E85]/30 rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all cursor-pointer appearance-none"
                required
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="International">International</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-xs">▼</div>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-bold block">
                History & Conditions
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "MEDS_CHRONIC", label: "Prescribed psychiatric medication" },
                  { id: "DIAGNOSED_SEVERE", label: "Severe diagnosed history" },
                  { id: "CLINICAL_SYMPTOMS", label: "Persistent clinical distress" },
                  { id: "TRAUMA_GRIEF", label: "Trauma, grief, or domestic issues" }
                ].map(condition => (
                  <button
                    type="button"
                    key={condition.id}
                    onClick={() => {
                      if (medicalConditions.includes(condition.id)) {
                        setMedicalConditions(prev => prev.filter(c => c !== condition.id));
                      } else {
                        setMedicalConditions(prev => [...prev, condition.id]);
                      }
                    }}
                    className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl border border-[#EDEBE7] hover:border-[#7A9E85]/30 bg-white cursor-pointer transition-all group"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${medicalConditions.includes(condition.id) ? 'bg-[#7A9E85] border-[#7A9E85]' : 'border-[#D1D5DB] group-hover:border-[#7A9E85]'}`}>
                      {medicalConditions.includes(condition.id) && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className={`text-xs transition-colors ${medicalConditions.includes(condition.id) ? 'text-[#2B2B2B] font-semibold' : 'text-[#6B6B6B] group-hover:text-[#2B2B2B]'}`}>
                      {condition.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={customMedicalHistory}
              onChange={(e) => setCustomMedicalHistory(e.target.value)}
              placeholder="Specify diagnosis / symptoms (optional) — e.g. Diagnosed OCD, currently taking Prozac 40mg."
              rows={2}
              className="w-full bg-[#FAF8F5] border border-[#EDEBE7] hover:border-[#7A9E85]/30 rounded-xl text-xs p-3.5 text-[#2B2B2B] placeholder-[#6B6B6B] outline-none focus:border-[#7A9E85] transition-all resize-none"
            />
          </div>

          <div className="space-y-3.5">
            <span className="text-[9px] text-[#6B6B6B] uppercase tracking-[0.15em] font-bold block">
              Safety Agreements
            </span>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setConsentPsychology(!consentPsychology)}
                className="w-full text-left flex items-start gap-3.5 cursor-pointer group"
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${consentPsychology ? 'bg-[#7A9E85] border-[#7A9E85]' : 'border-[#D1D5DB] group-hover:border-[#7A9E85]'}`}>
                  {consentPsychology && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <span className={`text-xs leading-relaxed transition-colors ${consentPsychology ? 'text-[#2B2B2B]' : 'text-[#6B6B6B] group-hover:text-[#2B2B2B]'}`}>
                  I understand that this is an automated program and <strong className="text-[#2B2B2B] font-bold">not</strong> a human therapist. I will seek human care for clinical treatment.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setConsentAnonymity(!consentAnonymity)}
                className="w-full text-left flex items-start gap-3.5 cursor-pointer group"
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${consentAnonymity ? 'bg-[#7A9E85] border-[#7A9E85]' : 'border-[#D1D5DB] group-hover:border-[#7A9E85]'}`}>
                  {consentAnonymity && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <span className={`text-xs leading-relaxed transition-colors ${consentAnonymity ? 'text-[#2B2B2B]' : 'text-[#6B6B6B] group-hover:text-[#2B2B2B]'}`}>
                  I agree that my account data is synced to the cloud under my Google account. Deleting my account removes all history permanently.
                </span>
              </button>
            </div>
          </div>

          {activeError && (
            <div className="p-3.5 bg-[#FDE8E8] border border-[#FCA5A5]/50 rounded-xl text-xs text-[#991B1B] flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{activeError}</span>
            </div>
          )}

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={
                submitting ||
                (!displayName || !username || !consentPsychology || !consentAnonymity)
              }
              className="w-full py-3.5 bg-[#7A9E85] hover:bg-[#6B9080] text-white font-semibold text-xs cursor-pointer transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Register →</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorState(null);
                  setEmailTab("login");
                }}
                className="text-[10px] text-[#6B6B6B] hover:text-[#7A9E85] uppercase tracking-wider font-bold transition-all cursor-pointer bg-transparent border-none outline-none"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 md:pt-12 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {emailTab === "login" && !user ? renderLoginScreen() : renderSignupScreen()}
    </div>
  );
}
