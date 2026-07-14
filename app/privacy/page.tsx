import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-2xl space-y-8">
        
        <Link href="/" className="inline-flex items-center gap-2 font-sans text-[14px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors group">
          <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
        </Link>

        <div>
          <div className="w-10 h-1 bg-[oklch(0.20_0.02_260)] rounded-full mb-6"></div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-2">
            Last updated: July 2026
          </p>
        </div>

        <div className="font-sans text-[15px] text-[oklch(0.20_0.02_260)] space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">1. Account Information</h2>
            <p className="text-slate-600">
              We securely process and store your email address and authentication details using Supabase Authentication. This configuration keeps your private workspace credentials safe and restricts access to your data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">2. Training & Progress Metrics</h2>
            <p className="text-slate-600">
              To help you prepare effectively, we log which specific practice problems you solve successfully. This progress data populates your training indicators and keeps your tracking metrics synchronized.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">3. Data Integrity & Telemetry</h2>
            <p className="text-slate-600">
              Summit Olympiad operates without commercial advertising trackers or profile-building scripts. We do not transmit tracking metrics to data brokers. All drafted structures, solutions, and code modules remain your property.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}