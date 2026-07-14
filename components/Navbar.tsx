"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setProfile((prev: any) => ({ ...prev, ...customEvent.detail }));
      } else {
        fetchSession();
      }
    };
    
    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) await fetchProfile(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        display_name: newDisplayName,
        handle: newHandle.toLowerCase().replace(/\s+/g, '')
      })
      .eq("id", session.user.id);

    if (updateError) {
      setError(`Database Error: ${updateError.message}`);
      setSaving(false);
    } else {
      await fetchProfile(session.user.id);
      setSaving(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-[oklch(0.985_0.005_85)]/80 backdrop-blur border-b border-[oklch(0.90_0.01_85)]/70">
      <div className="mx-auto max-w-[1536px] h-full px-12 flex items-center justify-between">
        
        <Link href="/" className="font-serif text-[20px] font-semibold tracking-tight text-[oklch(0.20_0.02_260)] hover:opacity-90 transition-opacity">
          Summit Olympiad
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/olympiads/physics" className="text-[14px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors">Physics</Link>
            <Link href="/olympiads/math" className="text-[14px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors">Math</Link>
            <Link href="/olympiads/usaco" className="text-[14px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors">USACO</Link>
            <Link href="/about" className="text-[14px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors">About</Link>
          </div>

          <div className="flex items-center">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[oklch(0.45_0.02_260)] border-t-transparent"></div>
            ) : !session ? (
              <Link 
                href="/login" 
                className="bg-[oklch(0.20_0.02_260)] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            ) : !profile?.handle ? ( 
              
              <form onSubmit={handleSaveProfile} className="flex items-center gap-3">
                <input 
                  type="text" 
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="border border-[oklch(0.90_0.01_85)] bg-transparent px-3 py-1.5 rounded-md text-[13px] outline-none focus:border-[oklch(0.20_0.02_260)] w-40"
                />
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[13px] text-[oklch(0.45_0.02_260)]">@</span>
                  <input 
                    type="text" 
                    required
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="handle"
                    className="border border-[oklch(0.90_0.01_85)] bg-transparent pl-7 pr-3 py-1.5 rounded-md text-[13px] outline-none focus:border-[oklch(0.20_0.02_260)] w-32"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[oklch(0.20_0.02_260)] text-white px-4 py-1.5 rounded-md text-[13px] font-medium"
                >
                  {saving ? "..." : "Save"}
                </button>
                {error && <span className="text-red-500 text-[12px] absolute mt-12">{error}</span>}
              </form>

            ) : (

              <div className="flex items-center gap-6">
                <Link 
                  href="/settings"
                  className="flex items-center gap-3 group px-2 py-1 transition-all"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[oklch(0.90_0.01_85)] flex items-center justify-center bg-[oklch(0.94_0.02_85)] shrink-0">
                    {profile.avatar_url ? (
                      <img src={`${profile.avatar_url}?t=${Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px] font-bold text-[oklch(0.20_0.02_260)]">
                        {profile.display_name?.charAt(0).toUpperCase() || profile.handle?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <span className="text-[13px] font-bold text-[oklch(0.20_0.02_260)] leading-tight">
                      {profile.display_name}
                    </span>
                    <span className="text-[11px] font-medium text-[oklch(0.45_0.02_260)] leading-tight">
                      @{profile.handle}
                    </span>
                  </div>
                </Link>
                
                {/* 🚀 FIXED: Shows normal casing instead of ALL CAPS */}
                {(profile.role === "admin" || profile.role === "volunteer") && (
                  <Link 
                    href="/admin" 
                    className="text-[13px] font-bold text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors"
                  >
                    {profile.role === "admin" ? "Admin" : "Workspace"}
                  </Link>
                )}
                
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="text-[14px] font-sans text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </nav>
  );
}