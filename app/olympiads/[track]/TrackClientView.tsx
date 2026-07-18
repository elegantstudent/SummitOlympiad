"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface TrackClientViewProps {
  track: any;
  topics: any[];
  problemCounts: Record<string, number>;
  problemIdToTopic: Record<string, string>;
}

export default function TrackClientView({ track, topics, problemCounts, problemIdToTopic }: TrackClientViewProps) {
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchUserProgress() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      if (currentUserId && Object.keys(problemIdToTopic).length > 0) {
        const problemIds = Object.keys(problemIdToTopic);
        
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("problem_id")
          .eq("user_id", currentUserId)
          .in("problem_id", problemIds);

        const solved: Record<string, number> = {};
        if (progressData) {
          progressData.forEach(p => {
            const tId = problemIdToTopic[p.problem_id];
            if (tId) {
              solved[tId] = (solved[tId] || 0) + 1;
            }
          });
        }
        setSolvedCounts(solved);
      }
    }
    fetchUserProgress();
  }, [problemIdToTopic]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-3xl animate-in fade-in duration-500">
        
        <Link href="/" className="inline-flex items-center gap-2 font-sans text-[13px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors mb-10 group">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>

        {/* Track Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            {track.name}
          </h1>
          <p className="font-sans text-[16px] text-[oklch(0.45_0.02_260)] mt-2">
            {track.description}
          </p>
        </div>

        {/* The Curriculum Topic List with Progress Bars */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <p className="text-[14px] text-slate-400 font-sans">Curriculum is currently being drafted.</p>
          ) : (
            topics.map((topic) => {
              const total = problemCounts[topic.id] || 0;
              const solved = solvedCounts[topic.id] || 0;
              
              // Math for the progress bar
              const progressPercent = total === 0 ? 0 : Math.round((solved / total) * 100);

              return (
                <Link 
                  key={topic.id} 
                  href={`/olympiads/${track.slug}/${topic.slug}`}
                  className="block p-6 border border-[oklch(0.90_0.01_85)] rounded-xl hover:border-[oklch(0.20_0.02_260)] transition-colors group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)]">
                        {topic.title}
                      </h2>
                      <p className="font-sans text-[14px] text-[oklch(0.45_0.02_260)] mt-1">
                        {topic.description}
                      </p>
                    </div>
                    {/* Metrics Display */}
                    <span className="font-sans text-[12px] font-bold tracking-wider uppercase text-[oklch(0.45_0.02_260)]">
                      {solved} / {total} Solved
                    </span>
                  </div>

                  {/* The Dynamic Progress Bar Component */}
                  <div className="w-full h-[3px] bg-[oklch(0.95_0.01_85)] rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${progressPercent}%`, 
                        backgroundColor: track.accent_color 
                      }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}