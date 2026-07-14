"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState(""); // Changed from username to handle
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }
      setSession(session);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setHandle(data.handle || ""); // Fetching 'handle' instead of 'username'
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    }
    getProfile();
  }, [router]);

  const compressAndUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      setMessage({ text: "", type: "" });

      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          canvas.width = 150;
          canvas.height = 150;
          
          ctx?.drawImage(img, 0, 0, 150, 150);
          
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            const filePath = `avatar-${session.user.id}.webp`;

            const { error: uploadError } = await supabase.storage
              .from("avatars")
              .upload(filePath, blob, { contentType: "image/webp", upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            
            await supabase
              .from("profiles")
              .update({ avatar_url: publicUrl })
              .eq("id", session.user.id);

            setMessage({ text: "Profile picture updated successfully!", type: "success" });
            setUploadingAvatar(false);
            
            // 🚀 DRONE DELIVERY: Send the new image URL straight to the Navbar!
            window.dispatchEvent(new CustomEvent("profile-updated", {
              detail: { avatar_url: publicUrl }
            }));
          }, "image/webp", 0.8);
        };
      };
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to process image.", type: "error" });
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: "", type: "" });

    const cleanHandle = handle.toLowerCase().replace(/\s+/g, '');

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        handle: cleanHandle, // Saving to 'handle' instead of 'username'
      })
      .eq("id", session.user.id);

    if (error) {
      setMessage({ text: "That @unique handle is already taken!", type: "error" });
    } else {
      setMessage({ text: "Profile updated successfully!", type: "success" });
      
      // 🚀 DRONE DELIVERY: Send the new text straight to the Navbar!
      window.dispatchEvent(new CustomEvent("profile-updated", {
        detail: { display_name: displayName, handle: cleanHandle } // Passed 'handle'
      }));
      
      // 🚀 CACHE BUSTER: Tell Next.js to dump its memory before routing
      router.refresh();
      router.push("/");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-lg w-full mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Account Settings</h1>
      <p className="text-[14px] text-[var(--muted-foreground)] mb-8">Update your public identity card and handle info below.</p>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="flex items-center gap-6 p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
          
          {/* 🚀 ADDED: The group class and the hover pencil overlay! */}
          <div 
            className="relative group w-20 h-20 rounded-full overflow-hidden border border-[var(--border)] flex items-center justify-center bg-[var(--muted)] shrink-0 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={`${avatarUrl}?t=${Date.now()}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{displayName.charAt(0).toUpperCase() || "U"}</span>
            )}
            
            {/* The Pencil Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
            </div>

            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[14px] font-bold">Profile Identity Avatar</h3>
            <p className="text-[12px] text-[var(--muted-foreground)]">Images will automatically scale and compress to conserve data.</p>
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] font-medium bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Upload Custom Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={compressAndUploadAvatar} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold tracking-tight uppercase text-[var(--muted-foreground)]">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Math Wizard"
            className="w-full border border-[var(--border)] bg-transparent px-3 py-2.5 rounded-md text-[14px] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold tracking-tight uppercase text-[var(--muted-foreground)]">Unique Handle</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[14px] text-[var(--muted-foreground)]">@</span>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="unique_handle"
              className="w-full border border-[var(--border)] bg-transparent pl-8 pr-3 py-2.5 rounded-md text-[14px] outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-md text-[13px] font-medium ${message.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={updating || uploadingAvatar}
            className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updating ? "Saving Changes..." : "Save Account Settings"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-2.5 border border-[var(--border)] rounded-md text-[14px] font-medium hover:bg-[var(--muted)]/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}