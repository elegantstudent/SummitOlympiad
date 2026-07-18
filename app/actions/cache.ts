"use server";

import { revalidatePath } from "next/cache";

export async function refreshLiveContent() {
  // This tells Next.js to instantly trash the old cached snapshot
  // and fetch fresh data from Supabase the next time a student clicks a track.
  revalidatePath("/olympiads", "layout");
}