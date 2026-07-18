"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MarkdownRenderer from "./MarkdownRenderer";
import FormattingGuide from "./FormattingGuide";

interface EditorTab {
  localId: string;
  dbId?: string; 
  originalItemId?: string; // Tracks if this is a "Ghost Clone" edit
  title: string;
  contentType: "problem" | "theory";
  selectedTrack: string;
  selectedTopic: string;
  questionMd: string;
  exactAnswer: string;
  solutionMd: string;
  theoryMd: string;
}

export default function VolunteerEditor() {
  const [tabs, setTabs] = useState<EditorTab[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("summit_editor_tabs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [{
      localId: typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString(),
      title: "New Draft", contentType: "problem", selectedTrack: "", selectedTopic: "", questionMd: "", exactAnswer: "", solutionMd: "", theoryMd: ""
    }];
  });

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].localId);
  const [tracks, setTracks] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [cloudDrafts, setCloudDrafts] = useState<{problems: any[], lessons: any[]}>({ problems: [], lessons: [] });
  const [showDraftsMenu, setShowDraftsMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function fetchCloudData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: trackData } = await supabase.from("tracks").select("*").order("name");
      if (trackData) setTracks(trackData);

      if (user) {
        const { data: pDrafts } = await supabase.from("problems").select("id, original_item_id, question_md, exact_answer, solution_md, topic_id, topics(track_id)").eq("author_id", user.id).eq("status", "draft");
        const { data: lDrafts } = await supabase.from("lessons").select("id, original_item_id, content_md, topic_id, topics(track_id)").eq("author_id", user.id).eq("status", "draft");
        setCloudDrafts({ problems: pDrafts || [], lessons: lDrafts || [] });
      }
    }
    fetchCloudData();

    // Listen for the "Suggest Edit" button from the Published tab
    const handleEditRequest = (e: any) => {
      const item = e.detail;
      const newId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString();
      
      const newTab: EditorTab = {
        localId: newId,
        originalItemId: item.id, // Mark it as a Ghost Clone
        title: "✏️ Editing Live Content",
        contentType: item.type,
        selectedTrack: item.topics?.tracks?.id || "",
        selectedTopic: item.topic_id || "",
        questionMd: item.question_md || "",
        exactAnswer: item.exact_answer || "",
        solutionMd: item.solution_md || "",
        theoryMd: item.content_md || ""
      };

      setTabs(prev => {
        if (prev.length >= 5) {
          alert("Tab limit reached. Closing your oldest tab to open this edit.");
          return [...prev.slice(1), newTab];
        }
        return [...prev, newTab];
      });
      setActiveTabId(newId);
    };

    window.addEventListener("request-suggest-edit", handleEditRequest);
    return () => window.removeEventListener("request-suggest-edit", handleEditRequest);
  }, []);

  useEffect(() => {
    localStorage.setItem("summit_editor_tabs", JSON.stringify(tabs));
  }, [tabs]);

  const activeTab = tabs.find(t => t.localId === activeTabId) || tabs[0];

  useEffect(() => {
    if (!activeTab?.selectedTrack) {
      setTopics([]);
      return;
    }
    async function loadTopics() {
      const { data } = await supabase.from("topics").select("*").eq("track_id", activeTab!.selectedTrack).order("title"); 
      if (data) setTopics(data);
    }
    loadTopics();
  }, [activeTab?.selectedTrack]);

  const addNewTab = () => {
    if (tabs.length >= 5) return alert("You can only have 5 tabs open at a time.");
    const newId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString();
    setTabs(prev => [...prev, { localId: newId, title: "New Draft", contentType: "problem", selectedTrack: "", selectedTopic: "", questionMd: "", exactAnswer: "", solutionMd: "", theoryMd: "" }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) return setTabs([{ ...tabs[0], localId: typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString(), dbId: undefined, originalItemId: undefined, title: "New Draft", questionMd: "", exactAnswer: "", solutionMd: "", theoryMd: "", selectedTopic: "" }]);
    const newTabs = tabs.filter(t => t.localId !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].localId);
  };

  const updateActiveTab = (field: keyof EditorTab, value: string) => {
    setTabs(prev => prev.map(t => {
      if (t.localId === activeTabId) {
        if (field === "selectedTrack") return { ...t, [field]: value, selectedTopic: "" };
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const loadCloudDraftIntoTab = (draft: any, type: "problem" | "theory") => {
    const alreadyOpen = tabs.find(t => t.dbId === draft.id);
    if (alreadyOpen) { setActiveTabId(alreadyOpen.localId); setShowDraftsMenu(false); return; }
    if (tabs.length >= 5) return alert("You can only have 5 tabs open at a time.");
    
    const newId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString();
    setTabs(prev => [...prev, {
      localId: newId, dbId: draft.id, originalItemId: draft.original_item_id,
      title: draft.original_item_id ? "✏️ Edit Draft" : "Cloud Draft", 
      contentType: type, selectedTrack: draft.topics?.track_id || "", selectedTopic: draft.topic_id || "", 
      questionMd: draft.question_md || "", exactAnswer: draft.exact_answer || "", solutionMd: draft.solution_md || "", theoryMd: draft.content_md || ""
    }]);
    setActiveTabId(newId);
    setShowDraftsMenu(false);
  };

  const handleDeleteDraft = async (id: string, type: "problem" | "theory") => {
    if (!confirm("Are you sure you want to permanently delete this draft from the cloud?")) return;
    const table = type === "problem" ? "problems" : "lessons";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      if (type === "problem") setCloudDrafts(prev => ({ ...prev, problems: prev.problems.filter(p => p.id !== id) }));
      else setCloudDrafts(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== id) }));
      setTabs(prev => prev.map(t => t.dbId === id ? { ...t, dbId: undefined, originalItemId: undefined, title: "New Draft" } : t));
    }
  };

  const handleSaveToCloud = async (targetStatus: "draft" | "pending_review") => {
    if (!activeTab?.selectedTopic) return setMessage({ text: "Please select a Track and Topic before saving.", type: "error" });

    if (targetStatus === "draft" && !activeTab.dbId) {
      const totalDrafts = cloudDrafts.problems.length + cloudDrafts.lessons.length;
      if (totalDrafts >= 5) return setMessage({ text: "Cloud Draft limit reached (5/5).", type: "error" });
    }
    
    setSaving(true);
    setMessage({ text: "", type: "" });
    const { data: { user } } = await supabase.auth.getUser();

    try {
      let returnedDbId = activeTab.dbId;

      if (activeTab.contentType === "problem") {
        const payload = { topic_id: activeTab.selectedTopic, question_md: activeTab.questionMd, exact_answer: activeTab.exactAnswer, solution_md: activeTab.solutionMd, status: targetStatus, author_id: user?.id, original_item_id: activeTab.originalItemId || null };
        if (activeTab.dbId) {
          const { error } = await supabase.from("problems").update(payload).eq("id", activeTab.dbId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("problems").insert(payload).select().single();
          if (error) throw error;
          returnedDbId = data.id;
        }
      } else {
        const payload = { topic_id: activeTab.selectedTopic, content_md: activeTab.theoryMd, status: targetStatus, author_id: user?.id, original_item_id: activeTab.originalItemId || null };
        if (activeTab.dbId) {
          const { error } = await supabase.from("lessons").update(payload).eq("id", activeTab.dbId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("lessons").insert(payload).select().single();
          if (error) throw error;
          returnedDbId = data.id;
        }
      }

      if (targetStatus === "pending_review") {
        closeTab(activeTabId);
        setMessage({ text: "Submitted to Admin Verification Queue!", type: "success" });
      } else {
        setTabs(prev => prev.map(t => t.localId === activeTabId ? { ...t, dbId: returnedDbId, title: activeTab.originalItemId ? "✏️ Edit Draft" : "Cloud Draft" } : t));
        setMessage({ text: "Saved securely to your Cloud Drafts!", type: "success" });
        if (user) {
          const { data: pDrafts } = await supabase.from("problems").select("id, original_item_id, question_md, exact_answer, solution_md, topic_id, topics(track_id)").eq("author_id", user.id).eq("status", "draft");
          const { data: lDrafts } = await supabase.from("lessons").select("id, original_item_id, content_md, topic_id, topics(track_id)").eq("author_id", user.id).eq("status", "draft");
          setCloudDrafts({ problems: pDrafts || [], lessons: lDrafts || [] });
        }
      }
    } catch (err: any) {
      setMessage({ text: `Save failed: ${err.message}`, type: "error" });
    }
    setSaving(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 xl:grid-cols-2 border-t border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)]/30">
      <div className="border-r border-[oklch(0.90_0.01_85)] flex flex-col h-full bg-white">
        
        <div className="flex items-center overflow-x-auto border-b border-[oklch(0.90_0.01_85)] bg-slate-50 pt-2 px-2 shrink-0 no-scrollbar">
          {tabs.map(tab => (
            <div key={tab.localId} onClick={() => { setActiveTabId(tab.localId); setMessage({ text: "", type: "" }); }}
              className={`flex items-center gap-2 px-4 py-2 text-[12px] font-medium border-t border-l border-r rounded-t-lg cursor-pointer max-w-[150px] ${activeTabId === tab.localId ? "bg-white border-[oklch(0.90_0.01_85)] text-[oklch(0.20_0.02_260)] -mb-px z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]" : "bg-transparent border-transparent text-slate-400 hover:bg-slate-200/50 hover:text-slate-600"}`}>
              <span className="truncate">{tab.title}</span>
              <button type="button" onClick={(e) => closeTab(tab.localId, e)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded px-1 ml-auto">×</button>
            </div>
          ))}
          <button type="button" onClick={addNewTab} className="px-3 py-1.5 ml-2 text-[16px] text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">+</button>
        </div>

        <div className="p-8 pb-0 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] mb-1">Dynamic Editor</h2>
              <p className="text-[13px] text-[oklch(0.45_0.02_260)]">Progress is auto-saved locally as you type.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDraftsMenu(!showDraftsMenu)} className="text-[12px] font-bold tracking-wider uppercase text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200 px-3 py-1.5 rounded-md bg-white shadow-sm shrink-0">
                Cloud Drafts ({(cloudDrafts.problems.length + cloudDrafts.lessons.length) || 0}/5)
              </button>
              <button type="button" onClick={() => setShowGuide(!showGuide)} className="text-[13px] font-medium text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors border border-[oklch(0.90_0.01_85)] px-3 py-1.5 rounded-md bg-white shadow-sm shrink-0">
                {showGuide ? "Hide Guide" : "Show Guide"}
              </button>
            </div>
          </div>

          {showDraftsMenu && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in duration-200">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-blue-800 mb-3">Your Rejected & Saved Cloud Drafts</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {cloudDrafts.problems.length === 0 && cloudDrafts.lessons.length === 0 && <p className="text-[12px] text-blue-600/70">No drafts currently in the cloud.</p>}
                {cloudDrafts.problems.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                    <span className="text-[12px] font-medium text-slate-700 truncate mr-2">{p.original_item_id ? "✏️ Edit:" : "Prob:"} {p.question_md.substring(0, 40)}...</span>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleDeleteDraft(p.id, "problem")} className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-200">Delete</button>
                      <button type="button" onClick={() => loadCloudDraftIntoTab(p, "problem")} className="text-[11px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Open</button>
                    </div>
                  </div>
                ))}
                {cloudDrafts.lessons.map(l => (
                  <div key={l.id} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                    <span className="text-[12px] font-medium text-slate-700 truncate mr-2">{l.original_item_id ? "✏️ Edit:" : "Lesson:"} {l.content_md.substring(0, 40)}...</span>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleDeleteDraft(l.id, "theory")} className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-200">Delete</button>
                      <button type="button" onClick={() => loadCloudDraftIntoTab(l, "theory")} className="text-[11px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Open</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showGuide && <div className="mb-6 animate-in fade-in duration-200"><FormattingGuide /></div>}

          <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
            <button type="button" onClick={() => updateActiveTab("contentType", "problem")} className={`flex-1 text-[13px] font-medium py-2 rounded-md transition-all ${activeTab.contentType === "problem" ? "bg-white shadow-sm text-[oklch(0.20_0.02_260)]" : "text-slate-500 hover:text-slate-700"}`}>Practice Problem</button>
            <button type="button" onClick={() => updateActiveTab("contentType", "theory")} className={`flex-1 text-[13px] font-medium py-2 rounded-md transition-all ${activeTab.contentType === "theory" ? "bg-white shadow-sm text-[oklch(0.20_0.02_260)]" : "text-slate-500 hover:text-slate-700"}`}>Theory / Notes</button>
          </div>
        </div>

        <div className="p-8 pt-0 overflow-y-auto flex-1">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Track</label>
                <select value={activeTab.selectedTrack} onChange={(e) => updateActiveTab("selectedTrack", e.target.value)} className="border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] bg-white outline-none focus:border-black">
                  <option value="">Select Track...</option>
                  {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Topic</label>
                <select value={activeTab.selectedTopic} onChange={(e) => updateActiveTab("selectedTopic", e.target.value)} className="border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] bg-white outline-none disabled:bg-slate-50 focus:border-black" disabled={!activeTab.selectedTrack}>
                  <option value="">Select Topic...</option>
                  {topics.map(tp => <option key={tp.id} value={tp.id}>{tp.title}</option>)}
                </select>
              </div>
            </div>

            {activeTab.contentType === "problem" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Question Formulation</label>
                  <textarea rows={4} value={activeTab.questionMd} onChange={(e) => updateActiveTab("questionMd", e.target.value)} placeholder="Type your question statement here..." className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Exact Grader Answer</label>
                  <input type="text" value={activeTab.exactAnswer} onChange={(e) => updateActiveTab("exactAnswer", e.target.value)} placeholder="e.g., 42" className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-2.5 text-[14px] bg-white outline-none focus:border-[oklch(0.20_0.02_260)] font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Worked Solution</label>
                  <textarea rows={5} value={activeTab.solutionMd} onChange={(e) => updateActiveTab("solutionMd", e.target.value)} placeholder="Provide solution steps..." className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]" />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Theory / Notes Content</label>
                <textarea rows={14} value={activeTab.theoryMd} onChange={(e) => updateActiveTab("theoryMd", e.target.value)} placeholder="Write the full lesson module here..." className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]" />
              </div>
            )}

            {message.text && <p className={`text-[13px] font-medium p-3 rounded-md border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{message.text}</p>}

            <div className="flex items-center gap-3 pt-4 pb-8">
              <button type="button" onClick={() => handleSaveToCloud("draft")} disabled={saving} className="flex-1 bg-white border border-[oklch(0.90_0.01_85)] text-[oklch(0.20_0.02_260)] font-medium py-3 rounded-md text-[14px] hover:bg-slate-50 transition-colors disabled:opacity-50">
                {saving ? "..." : "Save to Cloud Drafts"}
              </button>
              <button type="button" onClick={() => handleSaveToCloud("pending_review")} disabled={saving} className="flex-1 bg-[oklch(0.20_0.02_260)] text-white font-medium py-3 rounded-md text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Publishing..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-8 bg-[oklch(0.985_0.005_85)]/50 overflow-y-auto space-y-8 h-full">
        <div><span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 bg-white border border-[oklch(0.90_0.01_85)] text-[oklch(0.45_0.02_260)] rounded-full">Live Preview (Auto-Saving)</span></div>
        {activeTab.contentType === "problem" ? (
          <>
            <div className="border border-dashed border-[oklch(0.85_0.01_85)] bg-white p-6 rounded-xl shadow-sm">
              <p className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Question Output</p>
              {activeTab.questionMd ? <MarkdownRenderer content={activeTab.questionMd} /> : <span className="text-[14px] italic text-slate-400">Composition shows here...</span>}
            </div>
            <div className="border border-dashed border-[oklch(0.85_0.01_85)] bg-white p-6 rounded-xl shadow-sm">
              <p className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Solution Dropdown Output</p>
              {activeTab.solutionMd ? <MarkdownRenderer content={activeTab.solutionMd} /> : <span className="text-[14px] italic text-slate-400">Worked breakdown shows here...</span>}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-[oklch(0.85_0.01_85)] bg-white p-6 rounded-xl min-h-[400px] shadow-sm">
            <p className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Lesson Output</p>
            {activeTab.theoryMd ? <MarkdownRenderer content={activeTab.theoryMd} /> : <span className="text-[14px] italic text-slate-400">Theory composition shows here...</span>}
          </div>
        )}
      </div>
    </div>
  );
}