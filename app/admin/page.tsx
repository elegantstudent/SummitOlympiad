"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import VolunteerEditor from "../../components/VolunteerEditor";
import MarkdownRenderer from "../../components/MarkdownRenderer";

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "moderation" | "team">("overview");
  const [userRole, setUserRole] = useState<"admin" | "volunteer" | null>(null);
  
  // Dynamic Stats
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalContent: 0,
    activeStudents: 0,
    pendingQueue: 0,
    volPending: 0,   // Volunteer's personal pending count
    volPublished: 0  // Volunteer's personal approved count
  });
  
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [teamRoster, setTeamRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 0. Get user session and role
    const { data: { session } } = await supabase.auth.getSession();
    let currentRole = "volunteer";
    let userId = "";
    
    if (session) {
      userId = session.user.id;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      if (profile) currentRole = profile.role;
      setUserRole(currentRole as "admin" | "volunteer");
    }

    // 1. Fetch Global Data
    const { count: trackCount } = await supabase.from("tracks").select("*", { count: "exact", head: true });
    const { count: studentCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student");
    
    // Fetch all content to calculate stats locally (fast enough for our scale)
    const { data: allProblems } = await supabase.from("problems").select("id, status, author_id");
    const { data: allLessons } = await supabase.from("lessons").select("id, status, author_id");

    const totalPending = 
      (allProblems?.filter(p => p.status === 'pending_review').length || 0) + 
      (allLessons?.filter(l => l.status === 'pending_review').length || 0);

    const totalPublished = 
      (allProblems?.filter(p => p.status === 'published').length || 0) + 
      (allLessons?.filter(l => l.status === 'published').length || 0);

    // Calculate personal volunteer stats
    const volPending = 
      (allProblems?.filter(p => p.author_id === userId && p.status === 'pending_review').length || 0) +
      (allLessons?.filter(l => l.author_id === userId && l.status === 'pending_review').length || 0);
      
    const volPublished = 
      (allProblems?.filter(p => p.author_id === userId && p.status === 'published').length || 0) +
      (allLessons?.filter(l => l.author_id === userId && l.status === 'published').length || 0);

    setStats({
      totalTracks: trackCount || 0,
      totalContent: totalPublished,
      activeStudents: studentCount || 0,
      pendingQueue: totalPending,
      volPending,
      volPublished
    });

    // 2. If Admin, fetch the Team Roster
    if (currentRole === "admin" && activeTab === "team") {
      const { data: roster } = await supabase.from("profiles").select("id, display_name, handle").eq("role", "volunteer");
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

    // 3. Fetch Problem Queue (Leaving Lessons out for now to keep UI simple, can add later)
    if (activeTab === "moderation" || activeTab === "overview") {
      const { data: queue } = await supabase
        .from("problems")
        .select(`id, question_md, exact_answer, solution_md, topics (title, tracks (name))`)
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });
      setPendingQueue(queue || []);
    }
    
    setLoading(false);
  };

  const handleModerate = async (id: string, action: "approve" | "reject") => {
    setActionMessage("");
    const newStatus = action === "approve" ? "published" : "draft";
    const { error } = await supabase.from("problems").update({ status: newStatus }).eq("id", id);
    
    if (!error) {
      setActionMessage(action === "approve" ? "Content verified and published live." : "Submission returned to author drafts.");
      fetchDashboardData();
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex bg-[oklch(0.985_0.005_85)]/20">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-[oklch(0.90_0.01_85)] p-8 flex flex-col justify-between shrink-0 bg-white">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-[20px] font-semibold text-[oklch(0.20_0.02_260)] tracking-tight">
              {userRole === "admin" ? "Summit Admin" : "Summit Workspace"}
            </h2>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[oklch(0.45_0.02_260)] mt-1">
              {userRole === "admin" ? "Internal Control Center" : "Contributor Lounge"}
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-left text-[14px] font-sans px-3 py-2 rounded-md transition-all ${activeTab === "overview" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`text-left text-[14px] font-sans px-3 py-2 rounded-md transition-all ${activeTab === "editor" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
            >
              Content Drafting
            </button>
            
            {userRole === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("moderation")}
                  className={`text-left text-[14px] font-sans px-3 py-2 rounded-md transition-all relative ${activeTab === "moderation" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
                >
                  Editorial Verification
                  {stats.pendingQueue > 0 && (
                    <span className="absolute right-3 top-2.5 bg-[#EF4444] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {stats.pendingQueue}
                    </span>
                  )}
                </button>
                
                {/* 🚀 NEW: Admin Team Management Tab */}
                <button
                  onClick={() => setActiveTab("team")}
                  className={`text-left text-[14px] font-sans px-3 py-2 rounded-md transition-all ${activeTab === "team" ? "bg-[oklch(0.94_0.02_85)] font-semibold text-[oklch(0.20_0.02_260)]" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
                >
                  Team Management
                </button>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN VIEWSPACE */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        
        {/* VIEW BLOCK 1: OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="p-10 space-y-10 max-w-6xl">
            <div>
              <h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
                {userRole === "admin" ? "Control Center" : "Your Contributor Stats"}
              </h1>
              <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">
                {userRole === "admin" ? "Real-time platform aggregates." : "Track the impact of the content you draft."}
              </p>
            </div>

            {/* 🚀 DYNAMIC METRIC CARDS BASED ON ROLE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {userRole === "admin" ? (
                <>
                  <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Total Subject Domains</p>
                    <p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalTracks} Tracks</p>
                  </div>
                  <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Published Live Content</p>
                    <p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalContent} Items</p>
                  </div>
                  <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Active Students Enrolled</p>
                    <p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.activeStudents} Users</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)] rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-2">Your Pending Drafts</p>
                    <p className="font-serif text-[36px] font-medium text-[oklch(0.45_0.02_260)]">{stats.volPending} Items</p>
                    <p className="text-[12px] text-slate-400 mt-2">Awaiting admin review.</p>
                  </div>
                  <div className="p-6 border border-emerald-100 bg-emerald-50 rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 mb-2">Your Published Content</p>
                    <p className="font-serif text-[36px] font-medium text-emerald-700">{stats.volPublished} Items</p>
                    <p className="text-[12px] text-emerald-600/70 mt-2">Live on the platform!</p>
                  </div>
                  <div className="p-6 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)] mb-2">Global Platform Content</p>
                    <p className="font-serif text-[36px] font-medium text-[oklch(0.20_0.02_260)]">{stats.totalContent} Items</p>
                    <p className="text-[12px] text-slate-400 mt-2">Total approved community submissions.</p>
                  </div>
                </>
              )}
            </div>

            {/* Mini Review Queue Preview (Only Admin) */}
            {userRole === "admin" && (
              <div className="p-8 border border-[oklch(0.90_0.01_85)] bg-white rounded-xl space-y-6">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)]">Verification Queue Preview</h3>
                  <button onClick={() => setActiveTab("moderation")} className="text-[13px] text-[oklch(0.45_0.02_260)] hover:underline">
                    View full inbox ({stats.pendingQueue}) &rarr;
                  </button>
                </div>

                {loading ? (
                  <div className="text-[14px] text-slate-400 py-4">Syncing...</div>
                ) : pendingQueue.length === 0 ? (
                  <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-lg p-8 text-center">
                    <p className="text-[14px] text-[oklch(0.45_0.02_260)] font-medium">No updates required</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[oklch(0.90_0.01_85)]">
                    {pendingQueue.slice(0, 2).map((p) => (
                      <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                            {p.topics?.tracks?.name} &bull; {p.topics?.title}
                          </span>
                          <div className="text-[14px] mt-2 text-[oklch(0.20_0.02_260)] line-clamp-2">{p.question_md}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW BLOCK 2: EMBEDDED DYNAMIC WORKSPACE EDITOR */}
        {activeTab === "editor" && <VolunteerEditor />}

        {/* VIEW BLOCK 3: MODERATION REVIEW ENGINE */}
        {activeTab === "moderation" && userRole === "admin" && (
           <div className="p-10 space-y-8 max-w-4xl">
             <h1 className="font-serif text-[32px] font-medium text-[oklch(0.20_0.02_260)]">Editorial Verification</h1>
             {/* Note: In a full app, we would map the lessons queue here too. Sticking to problems to conserve file size! */}
             {pendingQueue.map((item) => (
                <div key={item.id} className="p-6 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[oklch(0.90_0.01_85)]/60 pb-3">
                    <span className="text-[12px] font-mono font-bold text-[oklch(0.45_0.02_260)]">
                      {item.topics?.tracks?.name} &rarr; {item.topics?.title}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleModerate(item.id, "approve")} className="px-4 py-1.5 bg-[oklch(0.20_0.02_260)] text-white text-[13px] font-medium rounded-md hover:opacity-90">Approve</button>
                      <button onClick={() => handleModerate(item.id, "reject")} className="px-4 py-1.5 border border-red-200 text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg"><MarkdownRenderer content={item.question_md} /></div>
                  <div className="p-2 border border-slate-100 rounded bg-slate-50 text-[13px] font-mono font-bold">{item.exact_answer}</div>
                </div>
              ))}
           </div>
        )}

        {/* 🚀 NEW VIEW BLOCK 4: TEAM ROSTER (ADMIN ONLY) */}
        {activeTab === "team" && userRole === "admin" && (
          <div className="p-10 space-y-8 max-w-5xl">
            <div>
              <h1 className="font-serif text-[32px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
                Volunteer Team Roster
              </h1>
              <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1">
                Monitor individual contributions and output metrics across your team.
              </p>
            </div>

            <div className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[oklch(0.985_0.005_85)] border-b border-[oklch(0.90_0.01_85)]">
                    <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Volunteer</th>
                    <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Handle</th>
                    <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Drafts Pending</th>
                    <th className="px-6 py-4 text-[11px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">Approved Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(0.90_0.01_85)]">
                  {teamRoster.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-slate-400">No active volunteers found.</td>
                    </tr>
                  ) : (
                    teamRoster.map((vol) => (
                      <tr key={vol.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-[14px] font-medium text-[oklch(0.20_0.02_260)]">{vol.display_name || "Unknown"}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-mono">@{vol.handle || "no_handle"}</td>
                        <td className="px-6 py-4 text-[14px] font-bold text-slate-500">{vol.pending}</td>
                        <td className="px-6 py-4 text-[14px] font-bold text-emerald-600">{vol.published}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}