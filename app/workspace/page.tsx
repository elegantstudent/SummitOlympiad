"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import VolunteerEditor from "../../components/VolunteerEditor";
import MarkdownRenderer from "../../components/MarkdownRenderer";

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

export default function VolunteerWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "log-hours" | "my-published">("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [stats, setStats] = useState({ volPending: 0, volPublished: 0, totalContent: 0 });

  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [proofLink, setProofLink] = useState("");
  const [submitterNote, setSubmitterNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });
  const [claimHistory, setClaimHistory] = useState<any[]>([]);

  const [publishedContent, setPublishedContent] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkspaceData(true);
  }, []);

  useEffect(() => {
    fetchWorkspaceData(false);
  }, [activeTab]);

  const fetchWorkspaceData = async (isInitialLoad: boolean) => {
    if (isInitialLoad) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return router.push("/login");

    const userId = session.user.id;
    const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    
    if (!userProfile || (userProfile.role !== "volunteer" && userProfile.role !== "admin")) return router.push("/");
    setProfile(userProfile);

    if (activeTab === "overview") {
      const { data: problems } = await supabase.from("problems").select("status, author_id");
      const { data: lessons } = await supabase.from("lessons").select("status, author_id");
      const globalPublished = (problems?.filter(p => p.status === 'published').length || 0) + (lessons?.filter(l => l.status === 'published').length || 0);
      const pending = (problems?.filter(p => p.author_id === userId && p.status === 'pending_review').length || 0) + (lessons?.filter(l => l.author_id === userId && l.status === 'pending_review').length || 0);
      const published = (problems?.filter(p => p.author_id === userId && p.status === 'published').length || 0) + (lessons?.filter(l => l.author_id === userId && l.status === 'published').length || 0);
      setStats({ volPending: pending, volPublished: published, totalContent: globalPublished });
    }

    if (activeTab === "log-hours") {
      const { data: claims } = await supabase.from("volunteer_claims").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (claims) setClaimHistory(claims);
    }

    if (activeTab === "my-published") {
      const { data: pLive } = await supabase.from("problems").select(`id, created_at, question_md, exact_answer, solution_md, topic_id, topics (title, tracks (name, id))`).eq("author_id", userId).eq("status", "published");
      const { data: lLive } = await supabase.from("lessons").select(`id, created_at, content_md, topic_id, topics (title, tracks (name, id))`).eq("author_id", userId).eq("status", "published");
      
      const formattedProblems = (pLive || []).map(p => ({ ...p, type: 'problem' as const }));
      const formattedLessons = (lLive || []).map(l => ({ ...l, type: 'lesson' as const }));
      const merged = [...formattedProblems, ...formattedLessons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPublishedContent(merged);
    }

    if (isInitialLoad) setLoading(false);
  };

  const handleLogHours = async (e: FormEvent) => {
    e.preventDefault();
    if (taskIndex === 0) return setFormMessage({ text: "Please select a valid task.", type: "error" });
    if (!proofLink.trim()) return setFormMessage({ text: "Please provide a proof link.", type: "error" });

    setIsSubmitting(true);
    setFormMessage({ text: "", type: "" });
    const selectedTask = TASK_OPTIONS[taskIndex];
    const { error } = await supabase.from("volunteer_claims").insert({ user_id: profile.id, task_type: selectedTask.label, hours_requested: selectedTask.hours, proof_link: proofLink.trim(), submitter_note: submitterNote.trim() });

    if (error) setFormMessage({ text: `Failed to submit: ${error.message}`, type: "error" });
    else {
      setFormMessage({ text: "Claim submitted successfully and is pending review.", type: "success" });
      setTaskIndex(0); setProofLink(""); setSubmitterNote("");
      fetchWorkspaceData(false); 
    }
    setIsSubmitting(false);
  };

  const handleSuggestEdit = (item: any) => {
    // 1. Switch the screen to the Editor tab first
    setActiveTab("editor");
    
    // 2. Wait 100 milliseconds for the Editor to fully load, THEN send the problem data
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("request-suggest-edit", { detail: item }));
    }, 100);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><p className="text-[oklch(0.45_0.02_260)] font-sans">Accessing contributor lounge...</p></div>;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex bg-[oklch(0.985_0.005_85)]/20 font-sans">
      <aside className="w-64 border-r border-[oklch(0.90_0.01_85)] p-8 shrink-0 bg-white">
        <div className="space-y-8">
          <div><h2 className="font-serif text-[20px] font-semibold text-[oklch(0.20_0.02_260)] tracking-tight">Summit Workspace</h2><p className="text-[11px] font-medium uppercase tracking-wider text-[oklch(0.45_0.02_260)] mt-1">Contributor Lounge</p></div>
          <nav className="flex flex-col gap-1">
            <button onClick={() => setActiveTab("overview")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "overview" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Dashboard Overview</button>
            <button onClick={() => setActiveTab("log-hours")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "log-hours" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Log Service Hours</button>
            <button onClick={() => setActiveTab("editor")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "editor" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>Content Drafting</button>
            <button onClick={() => setActiveTab("my-published")} className={`text-left text-[14px] px-3 py-2 rounded-md transition-all ${activeTab === "my-published" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}>My Published Content</button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-10 bg-transparent">
        {activeTab === "overview" && (
          <div className="space-y-10 max-w-6xl animate-in fade-in duration-200">
            <div><h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">Your Contributor Stats</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Track the impact of the content you draft.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)] rounded-xl shadow-sm"><p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">Your Pending Drafts</p><p className="font-serif text-[36px] font-medium text-[oklch(0.45_0.02_260)]">{stats.volPending} Items</p></div>
              <div className="p-6 border border-emerald-100 bg-emerald-50 rounded-xl shadow-sm"><p className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 mb-2">Your Published Content</p><p className="font-serif text-[36px] font-medium text-emerald-700">{stats.volPublished} Items</p></div>
              <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl shadow-sm"><p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Global Platform Content</p><p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalContent} Items</p></div>
            </div>
          </div>
        )}

        {activeTab === "log-hours" && (
          <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
            <div><h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">Submission Manager</h1><p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">Submit your completed work here to receive official community service credit.</p></div>
            <form onSubmit={handleLogHours} className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl p-8 shadow-sm space-y-6">
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
              <div className="flex items-center gap-4 pt-4 border-t border-[oklch(0.95_0.01_85)]">
                <button type="submit" disabled={isSubmitting} className="bg-[oklch(0.20_0.02_260)] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit Claim for Review"}</button>
                {formMessage.text && <span className={`text-[13px] font-medium ${formMessage.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{formMessage.text}</span>}
              </div>
            </form>
            {claimHistory.length > 0 && (
              <div className="mt-12 space-y-4">
                <h3 className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)]">Submission History</h3>
                <div className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-[oklch(0.985_0.005_85)] border-b border-[oklch(0.90_0.01_85)]"><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Task Submitted</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Date</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] text-center">Hours</th><th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Status</th></tr></thead>
                    <tbody className="divide-y divide-[oklch(0.90_0.01_85)]">
                      {claimHistory.map((claim) => (
                        <tr key={claim.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 text-[14px] font-medium text-[oklch(0.20_0.02_260)] max-w-[250px] truncate" title={claim.task_type}>{claim.task_type}</td><td className="px-6 py-4 text-[13px] text-slate-500">{new Date(claim.created_at).toLocaleDateString()}</td><td className="px-6 py-4 text-[14px] font-bold text-slate-600 text-center">{claim.hours_requested}</td><td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${claim.status === 'pending' ? 'bg-amber-100 text-amber-800' : claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{claim.status}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "editor" && <div className="animate-in fade-in duration-200"><VolunteerEditor /></div>}

        {activeTab === "my-published" && (
           <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
             <div>
               <h1 className="font-serif text-[32px] font-medium text-[oklch(0.20_0.02_260)]">My Published Content</h1>
               <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">A portfolio of the items you have successfully published to the live platform.</p>
             </div>
             
             {publishedContent.length === 0 ? (
                <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-2xl p-12 text-center bg-white">
                  <p className="text-[14px] text-[oklch(0.45_0.02_260)]">You do not have any published items yet.</p>
                </div>
             ) : (
               publishedContent.map((item) => (
                  <div key={item.id} className="p-6 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[oklch(0.90_0.01_85)]/60 pb-3">
                      <span className="text-[12px] font-mono font-bold text-[oklch(0.45_0.02_260)]">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mr-2">LIVE</span>
                        {item.type === 'lesson' ? '📘 Theory' : '📝 Problem'} • {item.topics?.tracks?.name || "General"} &rarr; {item.topics?.title || "Item"}
                      </span>
                      <button 
                        onClick={() => handleSuggestEdit(item)} 
                        className="px-4 py-1.5 border border-[oklch(0.90_0.01_85)] text-[oklch(0.45_0.02_260)] text-[13px] font-medium rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        Suggest Edit
                      </button>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[oklch(0.95_0.01_85)] rounded-lg max-h-[150px] overflow-y-auto no-scrollbar">
                      <MarkdownRenderer content={item.type === 'problem' ? item.question_md : item.content_md} />
                    </div>
                  </div>
               ))
             )}
           </div>
        )}
      </main>
    </div>
  );
}