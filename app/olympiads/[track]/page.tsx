import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";
import TrackClientView from "./TrackClientView";

export const revalidate = 3600; // Cache for 1 hour (unless Admin clears it!)

// 🚀 Tell Next.js what tracks to pre-build during 'npm run build'
export async function generateStaticParams() {
  const { data: tracks } = await supabase.from("tracks").select("slug");
  return tracks?.map((t) => ({
    track: t.slug,
  })) || [];
}

interface PageProps {
  params: Promise<{ track: string }>;
}

export default async function TrackPage({ params }: PageProps) {
  const { track: trackSlug } = await params;

  // 1. Fetch Track details
  const { data: trackData } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", trackSlug)
    .single();

  if (!trackData) return notFound();

  // 2. Fetch Topics for this specific Track
  const { data: topicsData } = await supabase
    .from("topics")
    .select("*")
    .eq("track_id", trackData.id)
    .order("order_index", { ascending: true });

  const activeTopics = topicsData || [];

  // 3. Pre-calculate total published problems per topic on the server
  const totals: Record<string, number> = {};
  const problemIdToTopic: Record<string, string> = {};
  
  if (activeTopics.length > 0) {
    const topicIds = activeTopics.map(t => t.id);
    const { data: problemsData } = await supabase
      .from("problems")
      .select("id, topic_id")
      .in("topic_id", topicIds)
      .eq("status", "published");

    if (problemsData) {
      problemsData.forEach(p => {
        totals[p.topic_id] = (totals[p.topic_id] || 0) + 1;
        problemIdToTopic[p.id] = p.topic_id;
      });
    }
  }

  // 4. Pass the data to the Client Component
  return (
    <TrackClientView 
      track={trackData} 
      topics={activeTopics} 
      problemCounts={totals}
      problemIdToTopic={problemIdToTopic}
    />
  );
}