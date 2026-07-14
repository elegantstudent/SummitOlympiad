"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || (profile?.role !== "admin" && profile?.role !== "volunteer")) {
        return router.push("/");
      }
      setAuthorized(true);
    }
    checkAccess();
  }, [router]);

  if (!authorized) return null; // Wait for security check to pass
  return <>{children}</>;
}