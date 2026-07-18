import Footer from "../components/Footer";
import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "../components/Navbar";
import { Inter_Tight, Fraunces } from "next/font/google";

const interTight = Inter_Tight({ 
  subsets: ["latin"], 
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"], 
});

// 🚀 UPGRADED COMPREHENSIVE PRODUCTION SEO METADATA
export const metadata = {
  title: "Summit Olympiad | Advanced STEM Curriculum",
  description: "Master Physics, Mathematics, and USACO with free, elite curriculum arrays. Author core content to earn officially verified community service hours.",
  openGraph: {
    title: "Summit Olympiad",
    description: "Master advanced STEM disciplines and claim verified volunteer service credentials.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${interTight.variable} ${fraunces.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[oklch(0.985_0.005_85)] text-[oklch(0.20_0.02_260)] font-sans selection:bg-blue-200">
        <Navbar /> 
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}