import { supabase } from "../../../../lib/supabase";
import { notFound } from "next/navigation";
import TopicClientView from "./TopicClientView";

export const revalidate = 3600; // Cache for 1 hour (unless Admin clears it!)

// 🚀 Tell Next.js what topics to pre-build during 'npm run build'
export async function generateStaticParams() {
  const { data: topics } = await supabase.from("topics").select("slug, tracks(slug)");
  return topics?.map((t: any) => ({
    track: t.tracks?.slug,
    topic: t.slug,
  })) || [];
}

interface PageProps {
  params: Promise<{ track: string; topic: string }>;
}

export default async function TopicProblemsPage({ params }: PageProps) {
  // 1. Await params (Next.js 15 requirement)
  const { track: trackSlug, topic: topicSlug } = await params;

  // 2. Fetch the Track and Topic on the Server instantly
  const { data: trackData } = await supabase.from("tracks").select("*").eq("slug", trackSlug).single();
  if (!trackData) return notFound();

  const { data: topicData } = await supabase.from("topics").select("*").eq("track_id", trackData.id).eq("slug", topicSlug).single();
  if (!topicData) return notFound();

  // 3. Fetch the problems for this topic
  const { data: problemsData } = await supabase
    .from("problems")
    .select("*")
    .eq("topic_id", topicData.id)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const activeProblems = problemsData || [];

  // 4. Pass the fully loaded data down to the Client Component
  return (
    <TopicClientView 
      track={trackData} 
      topic={topicData} 
      initialProblems={activeProblems} 
    />
  );
}