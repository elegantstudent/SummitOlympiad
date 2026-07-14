import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[oklch(0.90_0.01_85)] bg-[oklch(0.985_0.005_85)]/50 py-8 mt-auto">
      <div className="max-w-[1536px] mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-serif text-[16px] font-medium tracking-tight text-[oklch(0.20_0.02_260)]">
            Summit Olympiad
          </span>
          <span className="text-[12px] font-sans text-[oklch(0.45_0.02_260)] tracking-wide ml-2">
            &copy; 2026. Train hard. Compete harder.
          </span>
        </div>

        <div className="flex gap-6 text-[12px] font-sans text-[oklch(0.45_0.02_260)]">
          <Link href="/privacy" className="hover:text-[oklch(0.20_0.02_260)] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[oklch(0.20_0.02_260)] transition-colors">
            Terms
          </Link>
          {/* Changed to routing link */}
          <Link href="/contact" className="hover:text-[oklch(0.20_0.02_260)] transition-colors">
            Contact
          </Link>
        </div>

      </div>
    </footer>
  );
}