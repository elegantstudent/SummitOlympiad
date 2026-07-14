import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="w-full flex justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 font-sans text-[14px] text-[oklch(0.45_0.02_260)] hover:text-[oklch(0.20_0.02_260)] transition-colors mb-12 group">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>

        {/* Subtle Eyebrow */}
        <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-[oklch(0.45_0.02_260)] mb-6">
          About
        </p>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-[48px] font-medium tracking-tight text-[oklch(0.20_0.02_260)] leading-tight mb-8">
          A quieter place to train for the olympiads.
        </h1>

        {/* Body Copy */}
        <div className="space-y-6 font-sans text-[18px] text-[oklch(0.45_0.02_260)] leading-relaxed">
          <p>
            Summit Olympiad is a single-purpose site for students working toward the F=ma / USAPhO, AMC / AIME, and USACO. Every topic is split into two halves: a set of clean, LaTeX-rendered notes to build intuition, and a curated problem set with fully worked solutions to build fluency.
          </p>
          <p>
            No streaks, no badges, no dashboards demanding your attention. Just the material, the problems, and enough structure to help you keep moving.
          </p>
          <p>
            Content is added and refined continuously. If you spot a mistake or want a topic covered, reach out. :)
          </p>
        </div>

        {/* Divider */}
        <hr className="my-12 border-t border-[oklch(0.90_0.01_85)]" />

        {/* Founder Section */}
        <div>
          <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-[oklch(0.45_0.02_260)] mb-8">
            Founder
          </p>
          
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-[oklch(0.94_0.02_85)] flex items-center justify-center shrink-0">
              <span className="font-serif text-[20px] font-medium text-[oklch(0.20_0.02_260)]">NK</span>
            </div>
            <div>
              <h3 className="font-serif text-[24px] font-medium text-[oklch(0.20_0.02_260)] leading-none">
                N.K.
              </h3>
              <p className="text-[14px] text-[oklch(0.45_0.02_260)] mt-1 mb-4">
                Founder
              </p>
              <p className="font-sans text-[16px] text-[oklch(0.45_0.02_260)] leading-relaxed">
                I built Summit Olympiad out of a personal frustration with how cluttered online learning platforms have become. When preparing for competitive exams, finding high-quality, distraction-free resources is half the battle. My goal was to create a tool where students can focus on studying without a bunch of gamified, distracting learning, "streaks", and whatever else there may be out there.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}