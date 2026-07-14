"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MarkdownRenderer from "./MarkdownRenderer";
import FormattingGuide from "./FormattingGuide";

export default function VolunteerEditor() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  const [showGuide, setShowGuide] = useState(false);
  const [contentType, setContentType] = useState<"problem" | "theory">("problem");

  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  
  // Problem State
  const [questionMd, setQuestionMd] = useState("");
  const [exactAnswer, setExactAnswer] = useState("");
  const [solutionMd, setSolutionMd] = useState("");
  
  // Theory State
  const [theoryMd, setTheoryMd] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Load Tracks independently
  useEffect(() => {
    async function loadTracks() {
      const { data, error } = await supabase.from("tracks").select("*").order("name");
      if (error) console.error("Error fetching tracks:", error);
      if (data) setTracks(data);
    }
    loadTracks();
  }, []);

  // Load Topics when Track changes
  useEffect(() => {
    if (!selectedTrack) {
      setTopics([]);
      return;
    }
    async function loadTopics() {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("track_id", selectedTrack)
        .order("title"); 
      
      if (error) console.error("Error fetching topics:", error);
      if (data) setTopics(data);
    }
    loadTopics();
  }, [selectedTrack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const { data: { user } } = await supabase.auth.getUser();

    if (contentType === "problem") {
      const { error } = await supabase.from("problems").insert({
        topic_id: selectedTopic,
        question_md: questionMd,
        exact_answer: exactAnswer,
        solution_md: solutionMd,
        status: "pending_review",
        author_id: user?.id
      });
      if (error) setMessage({ text: error.message, type: "error" });
      else {
        setMessage({ text: "Practice problem submitted for verification!", type: "success" });
        setQuestionMd(""); setExactAnswer(""); setSolutionMd("");
      }
    } else {
      const { error } = await supabase.from("lessons").insert({
        topic_id: selectedTopic,
        content_md: theoryMd,
        status: "pending_review",
        author_id: user?.id
      });
      if (error) setMessage({ text: error.message, type: "error" });
      else {
        setMessage({ text: "Theory lesson submitted for verification!", type: "success" });
        setTheoryMd("");
      }
    }
    setSaving(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 border-t border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)]/30">
      
      {/* LEFT SIDE: Write (Form Panel) */}
      <div className="p-8 border-r border-[oklch(0.90_0.01_85)] overflow-y-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] mb-1">Content Drafting</h2>
            <p className="text-[13px] text-[oklch(0.45_0.02_260)]">Submit practice problems or theory lessons to the queue.</p>
          </div>
          
          <button 
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[13px] font-sans font-medium text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors border border-[oklch(0.90_0.01_85)] px-3 py-1.5 rounded-md bg-white shadow-sm shrink-0 ml-4"
          >
            {showGuide ? "Hide Guide ↑" : "Show Guide ↓"}
          </button>
        </div>

        {showGuide && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <FormattingGuide />
          </div>
        )}

        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setContentType("problem")}
            className={`flex-1 text-[13px] font-medium py-2 rounded-md transition-all ${contentType === "problem" ? "bg-white shadow-sm text-[oklch(0.20_0.02_260)]" : "text-slate-500 hover:text-slate-700"}`}
          >
            Practice Problem
          </button>
          <button
            type="button"
            onClick={() => setContentType("theory")}
            className={`flex-1 text-[13px] font-medium py-2 rounded-md transition-all ${contentType === "theory" ? "bg-white shadow-sm text-[oklch(0.20_0.02_260)]" : "text-slate-500 hover:text-slate-700"}`}
          >
            Theory / Notes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Track</label>
              <select 
                value={selectedTrack} 
                onChange={(e) => { setSelectedTrack(e.target.value); setSelectedTopic(""); }}
                className="border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] bg-white outline-none"
                required
              >
                <option value="">Select Track...</option>
                {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Topic</label>
              <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="border border-[oklch(0.90_0.01_85)] rounded-md px-3 py-2 text-[14px] bg-white outline-none disabled:bg-slate-50"
                required
                disabled={!selectedTrack}
              >
                <option value="">Select Topic...</option>
                {topics.map(tp => <option key={tp.id} value={tp.id}>{tp.title}</option>)}
              </select>
            </div>
          </div>

          {contentType === "problem" ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Question Formulation</label>
                <textarea 
                  rows={4}
                  value={questionMd}
                  onChange={(e) => setQuestionMd(e.target.value)}
                  placeholder="Type your question statement here..."
                  className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Exact Grader Answer</label>
                <input 
                  type="text"
                  value={exactAnswer}
                  onChange={(e) => setExactAnswer(e.target.value)}
                  placeholder="e.g., 42"
                  className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-2.5 text-[14px] bg-white outline-none focus:border-[oklch(0.20_0.02_260)] font-mono"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Worked Solution</label>
                <textarea 
                  rows={5}
                  value={solutionMd}
                  onChange={(e) => setSolutionMd(e.target.value)}
                  placeholder="Provide solution steps..."
                  className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]"
                  required
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)]">Theory / Notes Content</label>
              <textarea 
                rows={14}
                value={theoryMd}
                onChange={(e) => setTheoryMd(e.target.value)}
                placeholder="Write the full lesson module here..."
                className="border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-3 text-[14px] font-mono bg-white outline-none focus:border-[oklch(0.20_0.02_260)]"
                required
              />
            </div>
          )}

          {message.text && (
            <p className={`text-[13px] font-medium p-3 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {message.text}
            </p>
          )}

          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-[oklch(0.20_0.02_260)] text-white font-medium py-3 rounded-md text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Publishing into Pipeline..." : "Submit to Verification Queue"}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: Real-Time Render Preview */}
      <div className="p-8 bg-white overflow-y-auto space-y-8">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 bg-[oklch(0.94_0.02_85)] text-[oklch(0.45_0.02_260)] rounded-full">
            Live Preview
          </span>
        </div>

        {contentType === "problem" ? (
          <>
            <div className="border border-dashed border-[oklch(0.90_0.01_85)] p-6 rounded-xl">
              <p className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Question Output</p>
              {questionMd ? <MarkdownRenderer content={questionMd} /> : <span className="text-[14px] italic text-slate-300">Composition shows here...</span>}
            </div>
            <div className="border border-dashed border-[oklch(0.90_0.01_85)] p-6 rounded-xl">
              <p className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Solution Dropdown Output</p>
              {solutionMd ? <MarkdownRenderer content={solutionMd} /> : <span className="text-[14px] italic text-slate-300">Worked breakdown shows here...</span>}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-[oklch(0.90_0.01_85)] p-6 rounded-xl min-h-[400px]">
            <p className="text-[12px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-4">Lesson Output</p>
            {theoryMd ? <MarkdownRenderer content={theoryMd} /> : <span className="text-[14px] italic text-slate-300">Theory composition shows here...</span>}
          </div>
        )}
      </div>

    </div>
  );
}