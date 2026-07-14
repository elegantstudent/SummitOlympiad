import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. Hero Section */}
      <section className="w-full max-w-4xl px-6 pt-24 pb-20 flex flex-col items-center text-center">
        
        {/* Subtle Eyebrow */}
        <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-[oklch(0.45_0.02_260)] mb-6">
          A Focused Prep Platform
        </p>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-tight text-[oklch(0.20_0.02_260)] leading-[1.1] mb-6">
          Prepare for the olympiads that matter, without the noise.
        </h1>

        {/* Sub-headline */}
        <p className="font-sans text-[18px] text-[oklch(0.45_0.02_260)] max-w-2xl mb-10 leading-relaxed">
          Clean notes and hand-picked practice problems for the F=ma / USAPhO, AMC / AIME, and USACO tracks. Read the theory, then work problems with full solutions. Email summitolympiad@gmail.com to become a volunteer, report a mistake, or ask a question! 

        </p>

        {/* Hero Action Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/olympiads/physics" 
            className="bg-[oklch(0.20_0.02_260)] text-white px-6 py-3 rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity"
          >
            Start with Physics
          </Link>
          <Link 
            href="/about" 
            className="border border-[oklch(0.90_0.01_85)] bg-transparent text-[oklch(0.20_0.02_260)] px-6 py-3 rounded-md text-[14px] font-medium hover:bg-[oklch(0.94_0.02_85)]/50 transition-colors"
          >
            About the project
          </Link>
        </div>
      </section>

      {/* 2. Olympiad Track Cards */}
      <section className="w-full max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Physics Card */}
          <Link 
            href="/olympiads/physics" 
            className="group flex flex-col p-8 rounded-2xl border border-[oklch(0.90_0.01_85)] bg-white hover:border-[oklch(0.45_0.02_260)]/30 transition-colors"
          >
            <div className="w-8 h-1.5 rounded-full bg-[#2563EB] mb-6"></div>
            <h2 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] mb-3">
              F=ma & USAPhO
            </h2>
            <p className="font-sans text-[15px] text-[oklch(0.45_0.02_260)] mb-8 flex-1 leading-relaxed">
              The path to the US Physics Olympiad — starting with F=ma and building toward USAPhO.
            </p>
            <span className="font-sans text-[14px] text-[oklch(0.45_0.02_260)] group-hover:text-[oklch(0.20_0.02_260)] transition-colors">
              Explore topics →
            </span>
          </Link>

          {/* Math Card */}
          <Link 
            href="/olympiads/math" 
            className="group flex flex-col p-8 rounded-2xl border border-[oklch(0.90_0.01_85)] bg-white hover:border-[oklch(0.45_0.02_260)]/30 transition-colors"
          >
            <div className="w-8 h-1.5 rounded-full bg-[#D97706] mb-6"></div>
            <h2 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] mb-3">
              AMC & AIME
            </h2>
            <p className="font-sans text-[15px] text-[oklch(0.45_0.02_260)] mb-8 flex-1 leading-relaxed">
              Competition mathematics from AMC 10/12 through AIME.
            </p>
            <span className="font-sans text-[14px] text-[oklch(0.45_0.02_260)] group-hover:text-[oklch(0.20_0.02_260)] transition-colors">
              Explore topics →
            </span>
          </Link>

          {/* USACO Card */}
          <Link 
            href="/olympiads/usaco" 
            className="group flex flex-col p-8 rounded-2xl border border-[oklch(0.90_0.01_85)] bg-white hover:border-[oklch(0.45_0.02_260)]/30 transition-colors"
          >
            <div className="w-8 h-1.5 rounded-full bg-[#059669] mb-6"></div>
            <h2 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] mb-3">
              USACO
            </h2>
            <p className="font-sans text-[15px] text-[oklch(0.45_0.02_260)] mb-8 flex-1 leading-relaxed">
              Algorithmic problem solving across USACO Bronze, Silver, Gold, and Platinum.
            </p>
            <span className="font-sans text-[14px] text-[oklch(0.45_0.02_260)] group-hover:text-[oklch(0.20_0.02_260)] transition-colors">
              Explore topics →
            </span>
          </Link>

        </div>
      </section>
      
    </div>
  );
}