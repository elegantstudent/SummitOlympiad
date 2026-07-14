"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    // If they cancel or error out inside the popup window
    if (error) {
      console.warn("OAuth flow interrupted or cancelled by the user.");
      if (window.opener) {
        // Just dissolve the popup; the main screen stays completely intact
        window.close();
      } else {
        router.push("/auth");
      }
      return;
    }

    // Success Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        if (window.opener) {
          // 1. Tell the parent dashboard behind the popup to teleport to the homepage
          window.opener.location.href = "/";
          // 2. Safely close this floating authentication window
          window.close();
        } else {
          // Fallback if loaded directly in a standard tab
          router.push("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        {/* Sleek Minimal Loading Spinner */}
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent"></div>
        <p className="text-[14px] text-[var(--muted-foreground)] font-medium">
          Verifying secure credentials...
        </p>
      </div>
    </div>
  );
}