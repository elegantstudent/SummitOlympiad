"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../../../../lib/supabase";
import ProblemCard from "../../../../components/ProblemCard";
import MarkdownRenderer from "../../../../components/MarkdownRenderer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ track: string; topic: string }>;
}

export default function TopicProblemsPage({ params }: PageProps) {
  const { track: trackSlug, topic: topicSlug } = use(params);

  const [track, setTrack] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"theory" | "practice">("theory");
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  useEffect(() => {
    fetchContent();
    setCurrentProblemIndex(0);
  }, [trackSlug, topicSlug]);

  const fetchContent = async () => {
    setLoading(true);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    const { data: trackData } = await supabase.from("tracks").select("*").eq("slug", trackSlug).single();
    if (!trackData) return setLoading(false);
    setTrack(trackData);

    const { data: topicData } = await supabase.from("topics").select("*").eq("track_id", trackData.id).eq("slug", topicSlug).single();
    if (!topicData) return setLoading(false);
    setTopic(topicData);

    const { data: problemsData } = await supabase
      .from("problems")
      .select("*")
      .eq("topic_id", topicData.id)
      .eq("status", "published")
      .order("order_index", { ascending: true });

    const activeProblems = problemsData || [];
    setProblems(activeProblems);

    // Fetch solved history
    if (currentUserId && activeProblems.length > 0) {
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("problem_id")
        .eq("user_id", currentUserId);

      if (progressData) {
        const solvedMap: Record<string, boolean> = {};
        progressData.forEach((p) => {
          solvedMap[p.problem_id] = true;
        });
        setSolvedProblems(solvedMap);
      }
    }

    setLoading(false);
  };

  const handleSolveProblem = async (problemId: string) => {
    if (solvedProblems[problemId]) return; // Avoid duplicate saves

    // Instantly update UI locally so user gets immediate visual feedback
    setSolvedProblems((prev) => ({ ...prev, [problemId]: true }));

    // 🚀 FOOLPROOF: Retrieve the absolute fresh active session directly from the client library
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (currentUserId) {
      const { error } = await supabase
        .from("user_progress")
        .insert([{ user_id: currentUserId, problem_id: problemId }]);

      if (error && error.code !== "23505") {
        console.error("Database error saving progress:", error.message);
      }
    } else {
      console.warn("No active session found. Progress not saved.");
    }
  };

  if (loading) return <div className="w-full text-center py-20 font-sans text-slate-400">Loading...</div>;
  if (!track || !topic) return <div className="w-full text-center py-20 font-sans text-red-500">Not found.</div>;

  const activeProblem = problems[currentProblemIndex];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-3xl">
        
        <Link href={`/olympiads/${trackSlug}`} className="inline-flex items-center gap-2 font-sans text-[13px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors mb-10 group">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to {track.name}
        </Link>

        {/* Header Block */}
        <div className="mb-10">
          <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full text-white" style={{ backgroundColor: track.accent_color }}>
            {topic.title}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-[oklch(0.20_0.02_260)] mt-4">
            {topic.title}
          </h1>
          <p className="font-sans text-[15px] text-[oklch(0.45_0.02_260)] mt-2 leading-relaxed">
            {topic.description}
          </p>
        </div>

        {/* Elegant Tab Switcher */}
        <div className="flex border-b border-[oklch(0.90_0.01_85)] mb-10">
          <button 
            onClick={() => setActiveTab("theory")}
            className={`pb-4 px-4 font-sans text-[14px] transition-colors relative ${activeTab === "theory" ? "text-[oklch(0.20_0.02_260)] font-medium" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
          >
            Curriculum Theory
            {activeTab === "theory" && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px]" style={{ backgroundColor: track.accent_color }} />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("practice")}
            className={`pb-4 px-4 font-sans text-[14px] transition-colors relative ${activeTab === "practice" ? "text-[oklch(0.20_0.02_260)] font-medium" : "text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)]"}`}
          >
            Practice Challenges
            {activeTab === "practice" && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px]" style={{ backgroundColor: track.accent_color }} />
            )}
          </button>
        </div>

        {/* Conditional Rendering based on Tab */}
        {activeTab === "theory" && (
          <div className="animate-in fade-in duration-500">
            <MarkdownRenderer content={topic.theory_md} />
          </div>
        )}

        {activeTab === "practice" && (
          <div className="animate-in fade-in duration-500">
            {problems.length === 0 ? (
              <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-xl p-12 text-center">
                <p className="text-[14px] text-[oklch(0.45_0.02_260)] font-medium">Workspace is Empty</p>
                <p className="text-[12px] text-slate-400 mt-1">No challenges published to this module yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Quiet Pagination Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[oklch(0.90_0.01_85)]">
                  <button 
                    onClick={() => setCurrentProblemIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentProblemIndex === 0}
                    className="text-[13px] font-sans font-medium text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] disabled:opacity-30 disabled:hover:text-[oklch(0.45_0.02_260)] transition-colors"
                  >
                    ← Previous
                  </button>

                  <span className="font-serif text-[18px] text-[oklch(0.45_0.02_260)] tracking-widest">
                    {String(currentProblemIndex + 1).padStart(2, "0")} / {String(problems.length).padStart(2, "0")}
                  </span>

                  <button 
                    onClick={() => setCurrentProblemIndex(prev => Math.min(problems.length - 1, prev + 1))}
                    disabled={currentProblemIndex === problems.length - 1}
                    className="text-[13px] font-sans font-medium text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] disabled:opacity-30 disabled:hover:text-[oklch(0.45_0.02_260)] transition-colors"
                  >
                    Next →
                  </button>
                </div>

                {/* The Active Problem */}
                <div key={activeProblem.id} className="pt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <ProblemCard 
                    questionMd={activeProblem.question_md}
                    exactAnswer={activeProblem.exact_answer}
                    solutionMd={activeProblem.solution_md}
                    accentColor={track.accent_color}
                    isSolved={!!solvedProblems[activeProblem.id]}
                    onSolve={() => handleSolveProblem(activeProblem.id)}
                  />
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}