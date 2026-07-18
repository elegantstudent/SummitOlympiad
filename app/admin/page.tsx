"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import VolunteerEditor from "../../components/VolunteerEditor";
import MarkdownRenderer from "../../components/MarkdownRenderer";
// 🚀 1. HERE IS THE IMPORT! Bringing in the Walkie-Talkie
import { refreshLiveContent } from "../actions/cache"; 

const TASK_OPTIONS = [
  { label: "Select a completed task...", hours: 0 },
  { label: "Drafted 1 Practice Problem + Solution", hours: 0.5 },
  { label: "Drafted 1 Complete Theory/Lesson Guide", hours: 2.5 },
  { label: "Published 1 Educational Video/Reel", hours: 1.5 },
  { label: "Completed 1 School Club Presentation", hours: 3.0 },
  { label: "Published 1 Community Outreach Article", hours: 1.5 },
  { label: "Completed Physical Flyer Campaign (5 Locations)", hours: 4.0 },
  { label: "Completed Teacher Email Outreach (10 Teachers)", hours: 1.0 },
  { label: "Hosted 1 Live Discord Study Session", hours: 2.0 },
  { label: "Custom / Other Task (Specify in notes)", hours: 0.0 }
];

export default function AdminControlCenter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "moderation" | "verify-hours" | "team" | "log-hours" | "live-content">("overview");
  const [userRole, setUserRole] = useState<"admin" | "volunteer" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  const [stats, setStats] = useState({
    totalTracks: 0, totalContent: 0, activeStudents: 0,
    pendingQueue: 0, pendingClaimsCount: 0,
    volPending: 0, volPublished: 0  
  });
  
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [teamRoster, setTeamRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);

  const [showPrompt, setShowPrompt] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPublic, setShowPublic] = useState(true);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [proofLink, setProofLink] = useState("");
  const [submitterNote, setSubmitterNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });
  const [claimHistory, setClaimHistory] = useState<any[]>([]);
  
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [claimHoursMap, setClaimHoursMap] = useState<Record<string, number>>({});

  // LIVE CONTENT MANAGEMENT STATE
  const [liveContent, setLiveContent] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [activeTab]);

  const fetchDashboardData = async (isInitialLoad: boolean) => {
    if (isInitialLoad) setLoading(true);
    setQueryError(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    let currentRole = "volunteer";
    let userId = "";
    
    if (session) {
      userId = session.user.id;
      setCurrentUserId(userId);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (profile) {
        currentRole = profile.role;
        const isTeamMember = profile.role === "volunteer" || profile.role === "admin";
        const missingNameData = !profile.first_name || !profile.last_name;
        const promptNotDismissed = profile.has_dismissed_prompt === false;
        if (isTeamMember && missingNameData && promptNotDismissed) setShowPrompt(true);
      }
      setUserRole(currentRole as "admin" | "volunteer");
    }

    const { count: trackCount } = await supabase.from("tracks").select("*", { count: "exact", head: true });
    const { count: studentCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student");
    const { data: allProblems } = await supabase.from("problems").select("id, status, author_id");
    const { data: allLessons } = await supabase.from("lessons").select("id, status, author_id");
    const { count: claimsCount } = await supabase.from("volunteer_claims").select("*", { count: "exact", head: true }).eq("status", "pending");

    const totalPending = (allProblems?.filter(p => p.status === 'pending_review').length || 0) + (allLessons?.filter(l => l.status === 'pending_review').length || 0);
    const totalPublished = (allProblems?.filter(p => p.status === 'published').length || 0) + (allLessons?.filter(l => l.status === 'published').length || 0);
    const volPending = (allProblems?.filter(p => p.author_id === userId && p.status === 'pending_review').length || 0) + (allLessons?.filter(l => l.author_id === userId && l.status === 'pending_review').length || 0);
    const volPublished = (allProblems?.filter(p => p.author_id === userId && p.status === 'published').length || 0) + (allLessons?.filter(l => l.author_id === userId && l.status === 'published').length || 0);

    setStats({
      totalTracks: trackCount || 0, totalContent: totalPublished, activeStudents: studentCount || 0,
      pendingQueue: totalPending, pendingClaimsCount: claimsCount || 0, volPending, volPublished
    });

    if (currentRole === "admin" && activeTab === "team") {
      const { data: roster } = await supabase.from("profiles").select("id, display_name, handle, first_name, last_name, total_hours, show_on_contributors, role").or("role.eq.volunteer,role.eq.admin");
      if (roster) {
        const aggregated = roster.map(vol => {
          const pPending = allProblems?.filter(p => p.author_id === vol.id && p.status === 'pending_review').length || 0;
          const lPending = allLessons?.filter(l => l.author_id === vol.id && l.status === 'pending_review').length || 0;
          const pPub = allProblems?.filter(p => p.author_id === vol.id && p.status === 'published').length || 0;
          const lPub = allLessons?.filter(l => l.author_id === vol.id && l.status === 'published').length || 0;
          return { ...vol, pending: pPending + lPending, published: pPub + lPub };
        });
        setTeamRoster(aggregated);
      }
    }

    if (activeTab === "moderation") {
      const { data: pQueue, error: pError } = await supabase.from("problems").select(`id, original_item_id, created_at, question_md, exact_answer, solution_md, topics (title, tracks (name))`).eq("status", "pending_review");
      const { data: lQueue, error: lError } = await supabase.from("lessons").select(`id, original_item_id, created_at, content_md, topics (title, tracks (name))`).eq("status", "pending_review");
      
      if (pError || lError) {
        setQueryError(pError?.message || lError?.message || "Error fetching queue");
      } else {
        const formattedProblems = (pQueue || []).map(p => ({ ...p, type: 'problem' as const }));
        const formattedLessons = (lQueue || []).map(l => ({ ...l, type: 'lesson' as const }));
        const merged = [...formattedProblems, ...formattedLessons].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setPendingQueue(merged);
      }
    }

    if (activeTab === "verify-hours") {
      const { data: claims, error: claimsError } = await supabase.from("volunteer_claims").select(`*, profiles(first_name, last_name, display_name, handle)`).eq("status", "pending").order("created_at", { ascending: true });
      if (claimsError) setQueryError(claimsError.message);
      else if (claims) {
        setPendingClaims(claims);
        const initialHoursMap: Record<string, number> = {};
        claims.forEach(c => { initialHoursMap[c.id] = c.hours_requested; });
        setClaimHoursMap(initialHoursMap);
      }
    }

    if (activeTab === "live-content") {
      const { data: pLive, error: pError } = await supabase.from("problems").select(`id, created_at, question_md, exact_answer, solution_md, topics (title, tracks (name))`).eq("status", "published");
      const { data: lLive, error: lError } = await supabase.from("lessons").select(`id, created_at, content_md, topics (title, tracks (name))`).eq("status", "published");
      
      if (pError || lError) {
        setQueryError(pError?.message || lError?.message || "Error fetching live content");
      } else {
        const formattedProblems = (pLive || []).map(p => ({ ...p, type: 'problem' as const }));
        const formattedLessons = (lLive || []).map(l => ({ ...l, type: 'lesson' as const }));
        const merged = [...formattedProblems, ...formattedLessons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLiveContent(merged);
      }
    }

    if (activeTab === "log-hours" && userId) {
      const { data: claims } = await supabase.from("volunteer_claims").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (claims) setClaimHistory(claims);
    }

    if (isInitialLoad) setLoading(false);
  };

  const handleModerate = async (item: any, action: "approve" | "reject") => {
    setActionMessage("");
    const table = item.type === "problem" ? "problems" : "lessons";
    
    // GHOST CLONE APPROVAL LOGIC
    if (action === "approve" && item.original_item_id) {
      // 1. Overwrite the original
      const payload = item.type === "problem" 
        ? { question_md: item.question_md, exact_answer: item.exact_answer, solution_md: item.solution_md } 
        : { content_md: item.content_md };
      await supabase.from(table).update(payload).eq("id", item.original_item_id);
      
      // 2. Delete the clone to save space
      await supabase.from(table).delete().eq("id", item.id);
      setActionMessage("Suggested Edit approved. Live site updated.");
      
      // 🚀 2. CALL THE WALKIE TALKIE (Clear Cache)
      await refreshLiveContent();
    } 
    // STANDARD APPROVAL LOGIC
    else if (action === "approve") {
      await supabase.from(table).update({ status: "published" }).eq("id", item.id);
      setActionMessage("New content verified and published live.");
      
      // 🚀 3. CALL THE WALKIE TALKIE (Clear Cache)
      await refreshLiveContent();
    } 
    // REJECTION LOGIC
    else {
      await supabase.from(table).update({ status: "draft" }).eq("id", item.id);
      setActionMessage("Submission returned to author drafts.");
    }
    
    fetchDashboardData(false);
  };

  const handleDeleteLiveContent = async (id: string, contentType: "problem" | "lesson") => {
    if (!confirm("Are you sure you want to PERMANENTLY DELETE this content? It will be removed from the live site immediately.")) return;
    
    setActionMessage("");
    const table = contentType === "problem" ? "problems" : "lessons";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      setQueryError(`Error deleting: ${error.message}`);
    } else {
      setActionMessage("Content permanently deleted.");
      
      // 🚀 4. CALL THE WALKIE TALKIE (Clear Cache)
      await refreshLiveContent();
      
      fetchDashboardData(false);
    }
  };

  const handleSaveLiveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setActionMessage("");
    const table = editingItem.type === "problem" ? "problems" : "lessons";
    const payload = editingItem.type === "problem" 
      ? { question_md: editingItem.question_md, exact_answer: editingItem.exact_answer, solution_md: editingItem.solution_md }
      : { content_md: editingItem.content_md };

    const { error } = await supabase.from(table).update(payload).eq("id", editingItem.id);
    if (error) {
      alert(`Error updating content: ${error.message}`);
    } else {
      setEditingItem(null);
      setActionMessage("Live content updated successfully.");
      
      // 🚀 5. CALL THE WALKIE TALKIE (Clear Cache)
      await refreshLiveContent();
      
      fetchDashboardData(false);
    }
  };

  const handleApproveClaim = async (claimId: string, profileId: string) => {
    setActionMessage("");
    const finalHours = claimHoursMap[claimId];
    const { error: claimError } = await supabase.from("volunteer_claims").update({ status: "approved", hours_requested: finalHours }).eq("id", claimId);
    if (claimError) return alert(`Error approving claim: ${claimError.message}`);
    await supabase.rpc("increment_volunteer_hours", { target_user_id: profileId, hours_to_add: finalHours });
    setActionMessage("Claim verified and hours added to user profile.");
    fetchDashboardData(false);
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!confirm("Are you sure you want to reject this claim? Hours will not be awarded.")) return;
    const { error } = await supabase.from("volunteer_claims").update({ status: "rejected" }).eq("id", claimId);
    if (!error) fetchDashboardData(false);
  };

  const handleLogAdminHours = async (e: FormEvent) => {
    e.preventDefault();
    if (taskIndex === 0) return setFormMessage({ text: "Please select a valid task.", type: "error" });
    if (!proofLink.trim()) return setFormMessage({ text: "Please provide a proof link.", type: "error" });

    setIsSubmitting(true);
    setFormMessage({ text: "", type: "" });
    const selectedTask = TASK_OPTIONS[taskIndex];
    const { error } = await supabase.from("volunteer_claims").insert({ user_id: currentUserId, task_type: selectedTask.label, hours_requested: selectedTask.hours, proof_link: proofLink.trim(), submitter_note: submitterNote.trim() });

    if (error) setFormMessage({ text: `Failed to submit: ${error.message}`, type: "error" });
    else {
      setFormMessage({ text: "Claim submitted successfully.", type: "success" });
      setTaskIndex(0); setProofLink(""); setSubmitterNote("");
      fetchDashboardData(false);
    }
    setIsSubmitting(false);
  };

  const handleSaveOnboarding = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsSavingPrompt(true);
    const { error } = await supabase.from("profiles").update({ first_name: firstName, last_name: lastName, show_on_contributors: showPublic, has_dismissed_prompt: true }).eq("id", currentUserId);
    if (!error) { setShowPrompt(false); fetchDashboardData(false); }
    setIsSavingPrompt(false);
  };

  const handleSkipOnboarding = async () => {
    if (!currentUserId) return;
    const { error } = await supabase.from("profiles").update({ has_dismissed_prompt: true }).eq("id", currentUserId);
    if (!error) setShowPrompt(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><p className="text-[oklch(0.45_0.02_260)] font-sans">Verifying access credentials...</p></div>;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex bg-[oklch(0.985_0.005_85)]/20 relative">
      <aside className="w-64 border-r border-[oklch(0.90_0.01_85)] p-8 flex flex-col justify-between shrink-0 bg-white font-sans">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-[oklch(0.20_0.02_260)] tracking-tight">{userRole === "admin" ? "Summit Admin" : "Summit Workspace"}</h2>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[oklch(0.45_0.02_260)] mt-1">{userRole === "admin" ? "Internal Control Center" : "Contributor Lounge"}</p>
          </div>
          <nav className="flex flex-col gap-1">
            <button onClick={() => setActiveTab("overview")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "overview" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Dashboard Overview</button>
            <button onClick={() => setActiveTab("editor")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "editor" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Content Drafting</button>
            <button onClick={() => setActiveTab("log-hours")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "log-hours" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Log Service Hours</button>
            {userRole === "admin" && (
              <>
                <button onClick={() => setActiveTab("moderation")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all relative ${activeTab === "moderation" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>
                  Content Verification {stats.pendingQueue > 0 && <span className="absolute right-3 top-2.5 bg-[#EF4444] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{stats.pendingQueue}</span>}
                </button>
                <button onClick={() => setActiveTab("live-content")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all relative ${activeTab === "live-content" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>
                  Manage Live Content
                </button>
                <button onClick={() => setActiveTab("verify-hours")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all relative ${activeTab === "verify-hours" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>
                  Hour Verification {stats.pendingClaimsCount > 0 && <span className="absolute right-3 top-2.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{stats.pendingClaimsCount}</span>}
                </button>
                <button onClick={() => setActiveTab("team")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "team" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Team Management</button>
              </>
            )}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto font-sans p-10">
        
        {showPrompt && (
          <div className="mb-8 bg-white border border-[oklch(0.90_0.01_85)] rounded-2xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-300 max-w-5xl">
            <h3 className="font-serif text-xl font-medium text-[oklch(0.20_0.02_260)] mb-1">Want credit for your work? 🌟</h3>
            <p className="text-[13px] text-[oklch(0.45_0.02_260)] mb-6">Add your name so we can officially log your volunteer hours.</p>
            <form onSubmit={handleSaveOnboarding} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-1.5 tracking-wider uppercase">First Name</label><input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-lg px-3 py-2 text-[14px]" /></div>
                <div><label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-1.5 tracking-wider uppercase">Last Name</label><input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-lg px-3 py-2 text-[14px]" /></div>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1"><input type="checkbox" checked={showPublic} onChange={(e) => setShowPublic(e.target.checked)} className="mt-0.5 rounded text-slate-900 border-[oklch(0.90_0.01_85)] focus:ring-slate-900" /><span className="text-[13px] text-[oklch(0.20_0.02_260)] font-medium">Show my profile on the public Contributors leaderboard</span></label>
              <div className="flex items-center gap-3 pt-4 border-t border-[oklch(0.95_0.01_85)]">
                <button type="submit" disabled={isSavingPrompt} className="bg-[oklch(0.20_0.02_260)] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-50">{isSavingPrompt ? "Saving..." : "Save Details"}</button>
                <button type="button" onClick={handleSkipOnboarding} className="text-[13px] text-[oklch(0.45_0.02_260)] font-medium hover:text-black transition-colors px-3 py-2">Skip for now</button>
              </div>
            </form>
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-10 max-w-6xl">
            <div><h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">{userRole === "admin" ? "Control Center" : "Your Contributor Stats"}</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">{userRole === "admin" ? "Real-time platform aggregates." : "Track the impact of the content you draft."}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)] rounded-xl"><p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Platform Subject Domains</p><p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalTracks} Tracks</p></div>
              <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl"><p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Live Published Content</p><p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalContent} Items</p></div>
              <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl"><p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Active Students</p><p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.activeStudents} Users</p></div>
            </div>
          </div>
        )}

        {/* EDITOR */}
        {activeTab === "editor" && <div className="animate-in fade-in duration-200"><VolunteerEditor /></div>}

        {/* LOG OWN HOURS */}
        {activeTab === "log-hours" && (
          <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
            <div><h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">Submission Manager</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Submit your completed work here to receive official community service credit.</p></div>
            <form onSubmit={handleLogAdminHours} className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Completed Task</label>
                  <select value={taskIndex} onChange={(e) => setTaskIndex(Number(e.target.value))} className="w-full border border-[oklch(0.90_0.01_85)] rounded-lg px-4 py-2.5 text-[14px] text-[oklch(0.20_0.02_260)] bg-white focus:outline-none focus:border-black">
                    {TASK_OPTIONS.map((task, idx) => <option key={idx} value={idx}>{task.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-2 tracking-wider uppercase">Auto-Calculated</label>
                  <div className="w-full border border-[oklch(0.95_0.01_85)] bg-slate-50 rounded-lg px-4 py-2.5 text-[14px] font-bold text-[oklch(0.20_0.02_260)] text-center">{TASK_OPTIONS[taskIndex].hours.toFixed(1)} hrs</div>
                </div>
              </div>
              <div><label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-1 tracking-wider uppercase">Proof Link</label><input type="text" required placeholder="https://..." value={proofLink} onChange={(e) => setProofLink(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-black" /></div>
              <div><label className="block text-[11px] font-bold text-[oklch(0.45_0.02_260)] mb-1 tracking-wider uppercase">Submitter's Note</label><textarea rows={3} value={submitterNote} onChange={(e) => setSubmitterNote(e.target.value)} className="w-full border border-[oklch(0.90_0.01_85)] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-black resize-y" /></div>
              <button type="submit" disabled={isSubmitting} className="bg-[oklch(0.20_0.02_260)] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit Claim for Review"}</button>
            </form>
          </div>
        )}

        {/* 🚀 ADMIN HOURS VERIFICATION INBOX */}
        {activeTab === "verify-hours" && userRole === "admin" && (
          <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
             <div><h1 className="font-serif text-[32px] font-medium text-[oklch(0.20_0.02_260)]">Hour Verification Queue</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Review, adjust, and approve service hours submitted by volunteers.</p></div>
             {actionMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[13px] font-medium">{actionMessage}</div>}
             {pendingClaims.length === 0 ? <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-2xl p-12 text-center bg-white"><p className="text-[14px] text-[oklch(0.45_0.02_260)]">Inbox empty. No pending hour claims require verification.</p></div> : (
               pendingClaims.map((claim) => (
                  <div key={claim.id} className="p-6 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl space-y-5 shadow-sm">
                    <div className="flex justify-between items-start border-b border-[oklch(0.90_0.01_85)]/60 pb-4">
                      <div><span className="text-[12px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">New Claim</span><h3 className="font-serif text-[18px] font-medium text-[oklch(0.20_0.02_260)] mt-2">{claim.profiles?.first_name ? `${claim.profiles.first_name} ${claim.profiles.last_name || ""}` : claim.profiles?.display_name}</h3><p className="text-[12px] text-slate-500 font-mono mt-0.5">@{claim.profiles?.handle}</p></div>
                      <div className="text-right"><span className="block text-[11px] font-bold tracking-wider uppercase text-slate-400">Date Logged</span><span className="text-[13px] text-[oklch(0.45_0.02_260)]">{new Date(claim.created_at).toLocaleDateString()}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="block text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-1">Task Completed</span><p className="text-[14px] font-medium text-[oklch(0.20_0.02_260)]">{claim.task_type}</p></div>
                      <div><span className="block text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-1">Provided Proof</span><a href={claim.proof_link} target="_blank" rel="noreferrer" className="text-[13px] text-blue-600 hover:underline truncate block">View Verification Link ↗</a></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[oklch(0.95_0.01_85)]">
                      <div className="flex items-center gap-3"><label className="text-[12px] font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)]">Hours to Award:</label><input type="number" step="0.5" min="0" value={claimHoursMap[claim.id] || 0} onChange={(e) => setClaimHoursMap({ ...claimHoursMap, [claim.id]: Number(e.target.value) })} className="w-20 border border-[oklch(0.90_0.01_85)] bg-slate-50 rounded-md px-3 py-1.5 text-[14px] font-bold text-center focus:outline-none focus:border-black" /></div>
                      <div className="flex gap-2"><button onClick={() => handleApproveClaim(claim.id, claim.user_id)} className="px-4 py-1.5 bg-[oklch(0.20_0.02_260)] text-white text-[13px] font-medium rounded-md hover:opacity-90">Approve</button><button onClick={() => handleRejectClaim(claim.id)} className="px-4 py-1.5 border border-red-200 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50">Reject</button></div>
                    </div>
                  </div>
               ))
             )}
          </div>
        )}

        {/* MODERATION TAB (Content Queue) */}
        {activeTab === "moderation" && userRole === "admin" && (
           <div className="space-y-8 max-w-4xl">
             <div><h1 className="font-serif text-[32px] font-medium text-[oklch(0.20_0.02_260)]">Content Verification</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Review entries submitted by platform creators.</p></div>
             {actionMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[13px] font-medium">{actionMessage}</div>}
             {pendingQueue.length === 0 ? <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-2xl p-12 text-center bg-white"><p className="text-[14px] text-[oklch(0.45_0.02_260)]">All clear. No entries require verification review.</p></div> : (
               pendingQueue.map((item) => (
                  <div key={item.id} className="p-6 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[oklch(0.90_0.01_85)]/60 pb-3">
                      <span className="text-[12px] font-mono font-bold text-[oklch(0.45_0.02_260)]">
                        {item.original_item_id ? <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-2">✏️ EDIT</span> : <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mr-2">NEW</span>}
                        {item.type === 'lesson' ? '📘 Theory' : '📝 Problem'} • {item.topics?.tracks?.name || "General"} &rarr; {item.topics?.title || "Draft Item"}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleModerate(item, "approve")} className="px-4 py-1.5 bg-[oklch(0.20_0.02_260)] text-white text-[13px] font-medium rounded-md hover:opacity-90">Approve</button>
                        <button onClick={() => handleModerate(item, "reject")} className="px-4 py-1.5 border border-red-200 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50">Reject</button>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[oklch(0.95_0.01_85)] rounded-lg">
                      <MarkdownRenderer content={item.type === 'problem' ? item.question_md : item.content_md} />
                    </div>
                    {item.type === 'problem' && item.exact_answer && (
                      <div className="p-3 border border-slate-100 rounded bg-slate-50 text-[13px] font-mono font-bold">Answer: {item.exact_answer}</div>
                    )}
                  </div>
               ))
             )}
           </div>
        )}

        {/* 🚀 NEW: MANAGE LIVE CONTENT TAB */}
        {activeTab === "live-content" && userRole === "admin" && (
           <div className="space-y-8 max-w-4xl">
             <div><h1 className="font-serif text-[32px] font-medium text-[oklch(0.20_0.02_260)]">Manage Live Content</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Edit or delete content that is currently published and visible to students.</p></div>
             {actionMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[13px] font-medium">{actionMessage}</div>}
             {queryError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px] font-mono">{queryError}</div>}
             
             {liveContent.length === 0 ? <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-2xl p-12 text-center bg-white"><p className="text-[14px] text-[oklch(0.45_0.02_260)]">No live content found on the platform.</p></div> : (
               liveContent.map((item) => (
                  <div key={item.id} className="p-6 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[oklch(0.90_0.01_85)]/60 pb-3">
                      <span className="text-[12px] font-mono font-bold text-[oklch(0.45_0.02_260)]">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mr-2">LIVE</span>
                        {item.type === 'lesson' ? '📘 Theory' : '📝 Problem'} • {item.topics?.tracks?.name || "General"} &rarr; {item.topics?.title || "Item"}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingItem(item)} className="px-4 py-1.5 bg-slate-100 text-[oklch(0.20_0.02_260)] text-[13px] font-medium rounded-md hover:bg-slate-200">Quick Edit</button>
                        <button onClick={() => handleDeleteLiveContent(item.id, item.type)} className="px-4 py-1.5 border border-red-200 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[oklch(0.95_0.01_85)] rounded-lg max-h-[150px] overflow-y-auto no-scrollbar">
                      <MarkdownRenderer content={item.type === 'problem' ? item.question_md : item.content_md} />
                    </div>
                  </div>
               ))
             )}
           </div>
        )}

        {/* TEAM ROSTER */}
        {activeTab === "team" && userRole === "admin" && (
          <div className="space-y-8 max-w-5xl">
            <div><h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">Volunteer Team Roster</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Monitor individual metrics and service hour totals across your team.</p></div>
            <div className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-[oklch(0.985_0.005_85)] border-b border-[oklch(0.90_0.01_85)]"><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Name</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Handle</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Role</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Hours</th></tr></thead>
                <tbody className="divide-y divide-[oklch(0.90_0.01_85)]">
                  {teamRoster.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 text-[14px] font-medium text-[oklch(0.20_0.02_260)]">{vol.first_name ? `${vol.first_name} ${vol.last_name || ""}` : (vol.display_name || "Unconfigured")}</td><td className="px-6 py-4 text-[13px] text-slate-500 font-mono">@{vol.handle || "no_handle"}</td><td className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)]">{vol.role}</td><td className="px-6 py-4 text-[14px] font-serif font-bold text-[oklch(0.20_0.02_260)]">{vol.total_hours || 0} hrs</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* QUICK EDIT MODAL OVERLAY */}
      {editingItem && (
        <div className="absolute inset-0 z-50 bg-[oklch(0.20_0.02_260)]/40 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[oklch(0.90_0.01_85)] flex justify-between items-center bg-[oklch(0.985_0.005_85)]">
              <h3 className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)]">Quick Edit Live Content</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-red-500 text-[20px]">&times;</button>
            </div>
            
            <form onSubmit={handleSaveLiveEdit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              {editingItem.type === 'problem' ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Question Formulation</label>
                    <textarea rows={4} value={editingItem.question_md} onChange={(e) => setEditingItem({ ...editingItem, question_md: e.target.value })} className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono focus:outline-none focus:border-black" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Exact Answer</label>
                    <input type="text" value={editingItem.exact_answer} onChange={(e) => setEditingItem({ ...editingItem, exact_answer: e.target.value })} className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-2.5 text-[14px] font-mono focus:outline-none focus:border-black" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Worked Solution</label>
                    <textarea rows={5} value={editingItem.solution_md} onChange={(e) => setEditingItem({ ...editingItem, solution_md: e.target.value })} className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono focus:outline-none focus:border-black" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Theory / Notes Content</label>
                  <textarea rows={12} value={editingItem.content_md} onChange={(e) => setEditingItem({ ...editingItem, content_md: e.target.value })} className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono focus:outline-none focus:border-black" />
                </div>
              )}

              <div className="pt-4 border-t border-[oklch(0.95_0.01_85)] flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2.5 text-[13px] font-medium text-[oklch(0.45_0.02_260)] hover:bg-slate-50 rounded-lg border border-[oklch(0.90_0.01_85)]">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-[13px] font-medium text-white bg-[oklch(0.20_0.02_260)] hover:bg-black rounded-lg">Update Live Site</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}