import Footer from "../components/Footer";
import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "../components/Navbar";
import { Inter_Tight, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

// Load Inter Tight for body text
const interTight = Inter_Tight({ 
  subsets: ["latin"], 
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
});

// Load Fraunces for headings/numbers
const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"], 
});

export const metadata = {
  title: "Summit Olympiad",
  description: "A focused prep platform for the olympiads that matter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply the fonts and the warm off-white background globally
    <html lang="en" className={`${interTight.variable} ${fraunces.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[oklch(0.985_0.005_85)] text-[oklch(0.20_0.02_260)] font-sans selection:bg-blue-200">
        <Navbar /> 
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
