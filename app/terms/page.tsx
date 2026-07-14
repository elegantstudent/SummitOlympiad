import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-2xl space-y-8">
        
        <Link href="/" className="inline-flex items-center gap-2 font-sans text-[14px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors group">
          <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
        </Link>

        <div>
          <div className="w-10 h-1 bg-[oklch(0.20_0.02_260)] rounded-full mb-6"></div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            Terms of Service
          </h1>
          <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-2">
            Last updated: July 2026
          </p>
        </div>

        <div className="font-sans text-[15px] text-[oklch(0.20_0.02_260)] space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">1. Permitted Use</h2>
            <p className="text-slate-600">
              Summit Olympiad provides resource environments intended for individual study, preparation, and peer review. Automated systems or scraping frameworks must not be used to copy or dump the platform's core content problem banks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">2. Contributor Standards</h2>
            <p className="text-slate-600">
              Writers and team contributors must supply original problem sets, structural formulations, and accurate solution outlines. Incorporating plagiarized materials or submitting malicious scripts to validation pipelines will result in profile suspension.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-[20px] font-medium tracking-tight mt-6">3. Educational Scope</h2>
            <p className="text-slate-600">
              Practice components are compiled to simulate competitive conditions. While our moderators review all formulas for accuracy, our content operates independently of national organizing structures (such as the MAA, AAPT, or USACO).
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}