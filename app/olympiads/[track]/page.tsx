"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface PageProps {
  params: Promise<{ track: string }>;
}

export default function TrackPage({ params }: PageProps) {
  const { track: trackSlug } = use(params);

  const [track, setTrack] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  
  // State to track progress metrics
  const [problemCounts, setProblemCounts] = useState<Record<string, number>>({});
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackData();
  }, [trackSlug]);

  const fetchTrackData = async () => {
    setLoading(true);

    // 1. Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // 2. Fetch Track details
    const { data: trackData } = await supabase
      .from("tracks")
      .select("*")
      .eq("slug", trackSlug)
      .single();

    if (!trackData) {
      setLoading(false);
      return;
    }
    setTrack(trackData);

    // 3. Fetch Topics for this specific Track
    const { data: topicsData } = await supabase
      .from("topics")
      .select("*")
      .eq("track_id", trackData.id)
      .order("order_index", { ascending: true });

    const activeTopics = topicsData || [];
    setTopics(activeTopics);

    // 4. Calculate progress bar metrics
    if (activeTopics.length > 0) {
      const topicIds = activeTopics.map(t => t.id);
      
      // Get all published problems to find the "Total" per topic
      const { data: problemsData } = await supabase
        .from("problems")
        .select("id, topic_id")
        .in("topic_id", topicIds)
        .eq("status", "published");

      const totals: Record<string, number> = {};
      const problemIdToTopic: Record<string, string> = {};

      if (problemsData) {
        problemsData.forEach(p => {
          totals[p.topic_id] = (totals[p.topic_id] || 0) + 1;
          problemIdToTopic[p.id] = p.topic_id;
        });
      }
      setProblemCounts(totals);

      // Get user's completed problems to find the "Solved" per topic
      if (currentUserId && problemsData && problemsData.length > 0) {
        const problemIds = problemsData.map(p => p.id);
        
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

    setLoading(false);
  };

  if (loading) return <div className="w-full text-center py-20 font-sans text-slate-400">Loading workspace...</div>;
  if (!track) return <div className="w-full text-center py-20 font-sans text-red-500">Track not found.</div>;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-3xl">
        
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
                  href={`/olympiads/${trackSlug}/${topic.slug}`}
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