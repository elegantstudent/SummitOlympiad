import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in duration-300">
        
        <div className="text-left">
          <Link href="/" className="inline-flex items-center gap-2 font-sans text-[14px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors group mb-8">
            <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
          </Link>
        </div>

        <div>
          <div className="w-10 h-1 bg-[oklch(0.20_0.02_260)] rounded-full mb-6 mx-auto"></div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            Get in touch
          </h1>
          <p className="font-sans text-[15px] text-[oklch(0.45_0.02_260)] mt-3 max-w-sm mx-auto leading-relaxed">
            Have questions about tracking progress, formatting curriculum content, or joining the volunteer pool? Drop us a line.
          </p>
        </div>

        {/* Static Display Block — No links or active handlers to trigger browser freezes */}
        <div className="p-6 border border-[oklch(0.90_0.01_85)] rounded-xl bg-[oklch(0.985_0.005_85)]/40 shadow-sm text-center">
          <p className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] mb-2">
            Direct Editorial Support
          </p>
          <span className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)] block break-all select-all selection:bg-blue-100">
            summitolympiad@gmail.com
          </span>
        </div>

        <p className="text-[12px] text-slate-400 font-sans max-w-xs mx-auto">
          We monitor submission logs and support requests daily. Response metrics typically settle within 24 to 48 hours.
        </p>

      </div>
    </div>
  );
}