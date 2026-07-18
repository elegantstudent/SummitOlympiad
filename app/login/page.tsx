"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: "Success! Check your email to confirm your account.", type: "success" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email address in the field above first.", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });

    setLoading(false);
    if (error) {
      setMessage({ text: `Recovery Error: ${error.message}`, type: "error" });
    } else {
      // 🛡️ Secure standard phrasing to prevent email enumeration
      setMessage({ text: "If an account matches this email, a recovery link has been sent!", type: "success" });
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage({ text: error.message, type: "error" });
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            {isSignUp ? "Join the Summit" : "Welcome back"}
          </h1>
          <p className="font-sans text-[14px] text-[oklch(0.45_0.02_260)] mt-2">
            {isSignUp ? "Create an account to track your progress." : "Sign in to continue your training."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] outline-none focus:border-[oklch(0.20_0.02_260)] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] outline-none focus:border-[oklch(0.20_0.02_260)] transition-colors"
              placeholder="••••••••"
            />
            {/* ⚡ Replaced to sit elegantly right under the input block on the right */}
            {!isSignUp && (
              <div className="flex justify-end mt-1.5 px-0.5">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-slate-400 hover:text-black transition-colors underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {message.text && (
            <div className={`p-3 rounded-md text-[13px] ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[oklch(0.20_0.02_260)] text-white font-medium py-3 rounded-md text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[oklch(0.90_0.01_85)]"></div>
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-white px-4 text-[oklch(0.45_0.02_260)] uppercase tracking-wider font-bold">Or continue with</span>
          </div>
        </div>

        {/* OAuth Providers */}
        <div className="space-y-3">
          <button 
            onClick={() => handleOAuth('google')}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-[oklch(0.90_0.01_85)] text-[oklch(0.20_0.02_260)] px-4 py-2.5 rounded-md text-[14px] font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <button 
            onClick={() => handleOAuth('github')}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white px-4 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#24292F]/90 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>

          <button 
            onClick={() => handleOAuth('discord')}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] text-white px-4 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#5865F2]/90 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z" />
            </svg>
            Discord
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMessage({ text: "", type: "" }); }}
            className="text-[13px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"
          >
            {isSignUp ? "Already have an account? Sign in." : "Don't have an account? Sign up."}
          </button>
        </div>

      </div>
    </div>
  );
}