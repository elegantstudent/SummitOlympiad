"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicContributors();
  }, []);

  const fetchPublicContributors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, display_name, handle, role, total_hours")
      .eq("show_on_contributors", true)
      .or("role.eq.volunteer,role.eq.admin")
      .order("total_hours", { ascending: false });

    if (!error && data) {
      setContributors(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-[oklch(0.45_0.02_260)] font-sans">Loading contributor directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-16 font-sans animate-in fade-in duration-500">
      
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-[oklch(0.20_0.02_260)] mb-4 tracking-tight">
          Platform Contributors
        </h1>
        <p className="text-[15px] text-[oklch(0.45_0.02_260)] max-w-md mx-auto leading-relaxed">
          The educators, developers, and builders creating open-source preparation materials for academic olympiads.
        </p>
      </div>

      {contributors.length === 0 ? (
        <div className="border border-dashed border-[oklch(0.90_0.01_85)] rounded-2xl p-12 text-center bg-white/50">
          <p className="text-[14px] text-[oklch(0.45_0.02_260)]">
            No public profiles are currently listed. Active team members can toggle their public directory visibility inside their settings panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contributors.map((member, index) => {
            const formattedName = member.first_name 
              ? `${member.first_name} ${member.last_name || ""}` 
              : member.display_name;

            return (
              <div 
                key={member.handle || index} 
                className="bg-white border border-[oklch(0.90_0.01_85)] rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-[18px] font-medium text-[oklch(0.20_0.02_260)]">
                      {formattedName}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      member.role === "admin" 
                        ? "bg-slate-900 text-white" 
                        : "bg-slate-100 text-[oklch(0.20_0.02_260)]"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 font-mono">
                    @{member.handle || "contributor"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-serif text-2xl font-bold text-[oklch(0.20_0.02_260)]">
                    {member.total_hours || 0}
                  </p>
                  <p className="text-[11px] font-bold text-[oklch(0.45_0.02_260)] uppercase tracking-wider">
                    Hours Verified
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER TEXT CALL TO ACTION AS REQUESTED */}
      <div className="mt-20 border-t border-[oklch(0.95_0.01_85)] pt-8 text-center">
        <p className="text-[14px] text-[oklch(0.20_0.02_260)] font-medium">
          Want to help build curriculum tracks and earn certified community service hours?
        </p>
        <p className="text-[13px] text-[oklch(0.45_0.02_260)] mt-1">
          Submit a volunteer application by emailing us directly at <span className="font-semibold text-black underline">summitolympiad@gmail.com</span>
        </p>
      </div>

    </div>
  );
}