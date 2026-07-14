"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle Email/Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "Check your email for the confirmation link!", type: "success" });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "Logged in successfully!", type: "success" });
        window.location.href = "/";
      }
    }
    setLoading(false);
  };

  // Handle Social OAuth Providers (Google, GitHub, Discord)
  const handleOAuthSignIn = async (provider: "google" | "github" | "discord") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[90vh] px-4 py-12 bg-[var(--background)]">
      
      {/* 🚀 STEP 1: GLOBAL BACK TO HOME ARROW BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="transform group-hover:-translate-x-1 transition-transform"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to home
      </Link>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[400px] text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-[var(--foreground)]">
            {isSignUp ? "Create an Account" : "Sign In"}
          </h1>
          <p className="text-[14px] text-[var(--muted-foreground)]">
            {isSignUp ? "Join us to track your progress and save problems." : "Track your olympiad progress and save problems."}
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Email</label>
            <input 
              type="email" 
              required
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--border)] bg-transparent px-3 py-2.5 rounded-md text-[14px] outline-none focus:border-[var(--foreground)] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--border)] bg-transparent px-3 py-2.5 rounded-md text-[14px] outline-none focus:border-[var(--foreground)] transition-colors"
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-md text-[13px] font-medium ${message.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-2.5 rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Decorative Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Or continue with</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Third-Party OAuth Buttons */}
        <div className="flex flex-col gap-2">
          {/* Google Button */}
          <button 
            onClick={() => handleOAuthSignIn("google")}
            className="w-full flex items-center justify-center gap-3 border border-[var(--border)] py-2 rounded-md text-[13px] font-medium hover:bg-[var(--muted)]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* GitHub Button */}
          <button 
            onClick={() => handleOAuthSignIn("github")}
            className="w-full flex items-center justify-center gap-3 border border-[var(--border)] py-2 rounded-md text-[13px] font-medium hover:bg-[var(--muted)]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>

          {/* Discord Button */}
          <button 
            onClick={() => handleOAuthSignIn("discord")}
            className="w-full flex items-center justify-center gap-3 border border-[var(--border)] py-2 rounded-md text-[13px] font-medium hover:bg-[var(--muted)]/20 transition-colors"
          >
            <svg viewBox="0 0 127.14 96.36" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.77-11,68.43,68.43,0,0,1-10.64-5.12c.9-.66,1.8-1.34,2.66-2a75.58,75.58,0,0,0,92.63,0c.86.69,1.76,1.37,2.66,2a68.41,68.41,0,0,1-10.64,5.12,74.74,74.74,0,0,0,6.77,11,105.66,105.66,0,0,0,30.63-18.83C129.24,50.7,123.51,27.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            Discord
          </button>
        </div>

        {/* View State Toggle Links */}
        <div className="pt-2 space-y-2">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage({ text: "", type: "" });
            }}
            className="text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline decoration-[var(--border)] transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in instead." : "Need an account? Sign up instead."}
          </button>
          
          <div className="pt-2">
            <Link 
              href="/admin" 
              className="text-[11px] font-bold tracking-widest uppercase text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}