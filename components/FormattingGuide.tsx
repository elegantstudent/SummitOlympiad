"use client";

import { useState } from "react";

export default function FormattingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[oklch(0.90_0.01_85)] rounded-xl px-5 py-4 text-left shadow-sm hover:bg-slate-50/50 transition-colors focus:outline-none"
      >
        <div>
          <h4 className="font-serif text-[16px] font-medium text-[oklch(0.20_0.02_260)]">LaTeX Formatting Reference</h4>
          <p className="text-[12px] text-[oklch(0.45_0.02_260)] mt-0.5">Click to view equation formatting commands</p>
        </div>
        <svg
          className={`w-4 h-4 text-[oklch(0.45_0.02_260)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border border-[oklch(0.90_0.01_85)] rounded-xl p-5 space-y-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="bg-amber-50/60 border border-amber-200 text-amber-950 p-4 rounded-lg text-[13px] leading-relaxed">
            <strong className="block text-[14px] font-medium mb-1">Mandatory Rule</strong>
            Mathematical statements, notation symbols, variables, or functions will fail to render unless enclosed by explicit math markers(dollar sign).
          </div>

          <div className="space-y-1">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)]">Equation Placement Styles</h5>
            <p className="text-[13px] text-[oklch(0.30_0.02_260)] leading-relaxed">
              Enclose syntax using single dollar signs <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[12px] text-black">$...$</code> for expressions inside standard sentences. Use double dollar signs <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[12px] text-black">$$...$$</code> to block out layout equations onto their own standalone, centered block rows.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.45_0.02_260)]">Symbol Reference Table</h5>
            <div className="border border-[oklch(0.95_0.01_85)] rounded-lg overflow-hidden">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[oklch(0.90_0.01_85)] text-[11px] font-bold uppercase text-[oklch(0.45_0.02_260)]">
                    <th className="p-2.5 pl-4">Target Format</th>
                    <th className="p-2.5">Code Input Formula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(0.95_0.01_85)] font-mono text-[12px] text-black">
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Fractions</td>
                    <td className="p-2.5">{"$\\frac{numerator}{denominator}$"}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Exponents / Powers</td>
                    <td className="p-2.5">{"$x^2$ or $e^{i\\pi}$"}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Subscript Variables</td>
                    <td className="p-2.5">{"$a_n$ or $v_{initial}$"}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Degrees (e.g., 180°)</td>
                    <td className="p-2.5">{"$180^\\circ$"}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Square Roots</td>
                    <td className="p-2.5">{"$\\sqrt{a + b}$"}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4 font-sans text-[13px] text-[oklch(0.30_0.02_260)]">Greek Vectors</td>
                    <td className="p-2.5">{"$\\phi, \\lambda, \\Omega, \\omega$"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}