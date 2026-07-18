"use client";

import { useEffect, useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import dynamic from "next/dynamic";
import CertificatePDF from "../../components/CertificatePDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p className="text-[12px] font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-md">Warming up PDF engine...</p>,
  }
);

type SettingsTab = "profile" | "privacy";

interface ProfileInitialData {
  display_name: string;
  handle: string;
  avatar_url: string;
  first_name: string;
  last_name: string;
  show_on_contributors: boolean;
  total_hours: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("student");
  
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<Blob | null>(null);
  
  // 🚀 New Password State
  const [newPassword, setNewPassword] = useState("");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOnContributors, setShowOnContributors] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  const [initialData, setInitialData] = useState<Partial<ProfileInitialData>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function fetchAccountData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();

      if (data) {
        const payload: ProfileInitialData = {
          display_name: data.display_name || "",
          handle: data.handle || "",
          avatar_url: data.avatar_url || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          show_on_contributors: data.show_on_contributors || false,
          total_hours: data.total_hours || 0
        };
        setInitialData(payload);
        setDisplayName(payload.display_name);
        setHandle(payload.handle);
        setAvatarUrl(payload.avatar_url);
        setFirstName(payload.first_name);
        setLastName(payload.last_name);
        setShowOnContributors(payload.show_on_contributors);
        setTotalHours(payload.total_hours);
        setUserRole(data.role || "student");
      }
      setLoading(false);
    }
    fetchAccountData();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const altered = 
      displayName !== initialData.display_name ||
      handle !== initialData.handle ||
      firstName !== initialData.first_name ||
      lastName !== initialData.last_name ||
      showOnContributors !== initialData.show_on_contributors ||
      pendingAvatar !== null ||
      newPassword.length > 0;
    
    setIsDirty(altered);
  }, [displayName, handle, firstName, lastName, showOnContributors, pendingAvatar, newPassword, initialData, loading]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes that will be lost.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage({ text: "", type: "" });
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 150;
        canvas.height = 150;
        ctx?.drawImage(img, 0, 0, 150, 150);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setPendingAvatar(blob);
            setAvatarUrl(URL.createObjectURL(blob));
          }
        }, "image/webp", 0.8);
      };
    };
  };

  const handleSaveIdentity = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    // 🚀 Handle Password Update First
    if (newPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordError) {
        setMessage({ text: `Password Error: ${passwordError.message}`, type: "error" });
        setIsSaving(false);
        return;
      }
    }

    let finalAvatarUrl = initialData.avatar_url;

    if (pendingAvatar) {
      const filePath = `avatar-${userId}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, pendingAvatar, { contentType: "image/webp", upsert: true });

      if (uploadError) {
        setMessage({ text: `Storage Error: ${uploadError.message}`, type: "error" });
        setIsSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      finalAvatarUrl = `${publicUrl}?t=${Date.now()}`;
    }

    const cleanHandle = handle.toLowerCase().replace(/\s+/g, '');
    const cleanDbUrl = finalAvatarUrl ? finalAvatarUrl.split('?')[0] : null;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, handle: cleanHandle, avatar_url: cleanDbUrl })
      .eq("id", userId);

    setIsSaving(false);
    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
        setMessage({ text: "already used by someone else", type: "error" });
      } else {
        setMessage({ text: `Database Error: ${error.message}`, type: "error" });
      }
    } else {
      setInitialData(prev => ({ ...prev, display_name: displayName, handle: cleanHandle, avatar_url: finalAvatarUrl }));
      setPendingAvatar(null);
      setNewPassword(""); // Clear the password field after successful save
      setMessage({ text: "Settings saved successfully!", type: "success" });
      window.dispatchEvent(new CustomEvent("profile-updated", { 
        detail: { display_name: displayName, handle: cleanHandle, avatar_url: finalAvatarUrl } 
      }));
    }
  };

  const handleSavePrivacy = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      show_on_contributors: showOnContributors
    }).eq("id", userId);

    setIsSaving(false);
    if (error) {
      setMessage({ text: `Database Error: ${error.message}`, type: "error" });
    } else {
      setInitialData(prev => ({ ...prev, first_name: firstName, last_name: lastName, show_on_contributors: showOnContributors }));
      setMessage({ text: "Settings saved!", type: "success" });
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: { first_name: firstName, last_name: lastName } }));
    }
  };

  const handleSafeCancel = () => {
    if (isDirty && !confirm("You have unsaved changes. Are you sure you want to leave?")) return;
    router.push("/");
  };

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh] text-[oklch(0.45_0.02_260)] font-sans">Syncing profile...</div>;

  return (
    <div className="max-w-[1536px] mx-auto w-full px-12 py-12 font-sans relative animate-in fade-in duration-300">
      
      <button onClick={handleSafeCancel} className="absolute top-2 left-12 flex items-center gap-2 text-[13px] font-medium text-[oklch(0.45_0.02_260)] hover:text-black transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Back to home
      </button>

      <div className="flex flex-col md:flex-row gap-12 pt-8">
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <h1 className="font-serif text-[28px] font-semibold text-[oklch(0.20_0.02_260)] tracking-tight mb-6">Settings</h1>
          
          <button type="button" onClick={() => { setActiveTab("profile"); setMessage({ text: "", type: "" }); }} className={`w-full text-left px-4 py-3 rounded-lg text-[14px] font-medium transition-all ${activeTab === "profile" ? "bg-white border border-[oklch(0.90_0.01_85)] shadow-sm font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:bg-black/5 border border-transparent"}`}>
            Profile Details
          </button>
          
          {(userRole === "admin" || userRole === "volunteer") && (
            <button type="button" onClick={() => { setActiveTab("privacy"); setMessage({ text: "", type: "" }); }} className={`w-full text-left px-4 py-3 rounded-lg text-[14px] font-medium transition-all ${activeTab === "privacy" ? "bg-white border border-[oklch(0.90_0.01_85)] shadow-sm font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:bg-black/5 border border-transparent"}`}>
              Volunteer Dashboard
            </button>
          )}
        </div>

        <div className="flex-1 bg-white rounded-2xl p-8 border border-[oklch(0.95_0.01_85)] shadow-sm min-h-[480px]">
          
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-200">
              <h2 className="font-serif text-xl font-medium text-[oklch(0.20_0.02_260)] mb-1">Profile Details</h2>
              <p className="text-[13px] text-[oklch(0.45_0.02_260)] mb-8">Manage how you appear on the platform.</p>
              
              <form onSubmit={handleSaveIdentity} className="space-y-6 max-w-xl">
                <div className="flex items-center gap-6 p-5 border border-[oklch(0.95_0.01_85)] rounded-xl bg-[oklch(0.985_0.005_85)]/40 max-w-md">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[oklch(0.90_0.01_85)] bg-white flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[oklch(0.45_0.02_260)]">
                        {displayName.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[oklch(0.20_0.02_260)]">Profile Image</h4>
                    <p className="text-[12px] text-[oklch(0.45_0.02_260)] mt-0.5 mb-2.5">Upload a square image (auto-resizes).</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[12px] font-medium bg-[oklch(0.20_0.02_260)] text-white px-3 py-1.5 rounded-md hover:bg-black transition-colors">
                      Upload Custom Image
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Display Name</label>
                    <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Unique Handle</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[13px] text-[oklch(0.45_0.02_260)]">@</span>
                      <input type="text" required value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-md pl-8 pr-3 py-2 text-[14px] outline-none focus:border-black" />
                    </div>
                  </div>
                  {/* 🚀 Change Password Field */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Update Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Leave blank to keep current password"
                      className="w-full border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-black placeholder:text-slate-300" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-[oklch(0.95_0.01_85)]">
                  <button type="submit" disabled={isSaving || !isDirty} className="bg-[oklch(0.20_0.02_260)] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={handleSafeCancel} className="border border-[oklch(0.90_0.01_85)] text-[oklch(0.20_0.02_260)] px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  {message.text && <span className={`text-[13px] font-medium ml-2 ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{message.text}</span>}
                </div>
              </form>
            </div>
          )}

          {activeTab === "privacy" && (userRole === "admin" || userRole === "volunteer") && (
            <div className="animate-in fade-in duration-200">
              <h2 className="font-serif text-xl font-medium text-[oklch(0.20_0.02_260)] mb-1">Volunteer Dashboard</h2>
              <p className="text-[13px] text-[oklch(0.45_0.02_260)] mb-8">Keep track of your volunteer service hours and privacy settings.</p>
              
              <div className="bg-slate-50 border border-[oklch(0.90_0.01_85)] rounded-xl p-5 mb-6 flex justify-between items-center max-w-xl">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)] mb-0.5">Verified Hours</h4>
                  <p className="text-[12px] text-slate-500">Service hours currently approved by admins.</p>
                </div>
                <span className="font-serif text-3xl text-[oklch(0.20_0.02_260)] font-bold">{totalHours} hrs</span>
              </div>

              {totalHours > 0 ? (
                <div className="mb-8 max-w-xl flex flex-col sm:flex-row gap-4 items-center justify-between p-5 border border-amber-200 rounded-xl bg-amber-50 animate-in fade-in duration-200">
                   <div>
                     <h4 className="text-[13px] font-semibold text-amber-900">Official Certificate</h4>
                     <p className="text-[12px] text-amber-700/80 mt-0.5">Download a digitally signed record of your service.</p>
                   </div>
                   <PDFDownloadLink 
                      document={<CertificatePDF firstName={firstName || initialData.first_name || ""} lastName={lastName || initialData.last_name || ""} totalHours={totalHours} />} 
                      fileName={`Summit_Olympiad_Certificate_${firstName || "Volunteer"}.pdf`}
                   >
                     {({ loading }) => (
                       <button type="button" disabled={loading} className="text-[12px] shrink-0 font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-5 py-2.5 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">
                         {loading ? "Generating..." : "Download PDF"}
                       </button>
                     )}
                   </PDFDownloadLink>
                </div>
              ) : (
                <div className="mb-8 max-w-xl p-5 border border-[oklch(0.90_0.01_85)] rounded-xl bg-[oklch(0.985_0.005_85)]/50 animate-in fade-in duration-200">
                  <h4 className="text-[13px] font-semibold text-[oklch(0.20_0.02_260)]">Official Certificate</h4>
                  <p className="text-[12px] text-[oklch(0.45_0.02_260)] mt-1">
                    No hours logged yet! Once an administrator approves your drafted content, your official, verified signature certificate will unlock right here.
                  </p>
                </div>
              )}

              <form onSubmit={handleSavePrivacy} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-black" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] outline-none focus:border-black" placeholder="Doe" />
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 border border-[oklch(0.95_0.01_85)] rounded-xl hover:bg-slate-50 cursor-pointer select-none">
                  <input type="checkbox" checked={showOnContributors} onChange={(e) => setShowOnContributors(e.target.checked)} className="mt-0.5 rounded text-slate-900 border-[oklch(0.90_0.01_85)] focus:ring-slate-900" />
                  <div className="text-[13px]">
                    <span className="block font-medium text-[oklch(0.20_0.02_260)]">Show my profile on the public Contributors leaderboard</span>
                    <span className="block text-slate-500 mt-0.5 font-normal text-[12px]">If unchecked, you are completely hidden from public directories.</span>
                  </div>
                </label>

                <div className="flex items-center gap-3 pt-6 border-t border-[oklch(0.95_0.01_85)]">
                  <button type="submit" disabled={isSaving || !isDirty} className="bg-[oklch(0.20_0.02_260)] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={handleSafeCancel} className="border border-[oklch(0.90_0.01_85)] text-[oklch(0.20_0.02_260)] px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  {message.text && <span className={`text-[13px] font-medium ml-2 ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{message.text}</span>}
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}