"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import ProblemCard from "../../../../components/ProblemCard";
import MarkdownRenderer from "../../../../components/MarkdownRenderer";
import Link from "next/link";

interface TopicClientViewProps {
  track: any;
  topic: any;
  initialProblems: any[];
}

export default function TopicClientView({ track, topic, initialProblems }: TopicClientViewProps) {
  const [activeTab, setActiveTab] = useState<"theory" | "practice">("theory");
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>({});

  // Fetch only the user's specific progress in the background (silent load)
  useEffect(() => {
    async function fetchUserProgress() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (currentUserId && initialProblems.length > 0) {
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
    }
    fetchUserProgress();
    // Reset problem index when the topic changes (if navigating via client)
    setCurrentProblemIndex(0);
  }, [topic.id, initialProblems.length]);

  const handleSolveProblem = async (problemId: string) => {
    if (solvedProblems[problemId]) return;

    // Instantly update UI locally
    setSolvedProblems((prev) => ({ ...prev, [problemId]: true }));

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

  const activeProblem = initialProblems[currentProblemIndex];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-3xl">
        
        <Link href={`/olympiads/${track.slug}`} className="inline-flex items-center gap-2 font-sans text-[13px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors mb-10 group">
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
            {initialProblems.length === 0 ? (
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
                    {String(currentProblemIndex + 1).padStart(2, "0")} / {String(initialProblems.length).padStart(2, "0")}
                  </span>

                  <button 
                    onClick={() => setCurrentProblemIndex(prev => Math.min(initialProblems.length - 1, prev + 1))}
                    disabled={currentProblemIndex === initialProblems.length - 1}
                    className="text-[13px] font-sans font-medium text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] disabled:opacity-30 disabled:hover:text-[oklch(0.45_0.02_260)] transition-colors"
                  >
                    Next →
                  </button>
                </div>

                {/* The Active Problem */}
                <div key={activeProblem?.id} className="pt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {activeProblem && (
                    <ProblemCard 
                      questionMd={activeProblem.question_md}
                      exactAnswer={activeProblem.exact_answer}
                      solutionMd={activeProblem.solution_md}
                      accentColor={track.accent_color}
                      isSolved={!!solvedProblems[activeProblem.id]}
                      onSolve={() => handleSolveProblem(activeProblem.id)}
                    />
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}