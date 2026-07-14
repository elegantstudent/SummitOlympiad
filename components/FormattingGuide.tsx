import React from "react";

export default function FormattingGuide() {
  return (
    <div className="bg-white border border-[oklch(0.90_0.01_85)] rounded-xl overflow-hidden flex flex-col h-full max-h-[700px] shadow-sm">
      
      <div className="bg-[oklch(0.985_0.005_85)] px-5 py-4 border-b border-[oklch(0.90_0.01_85)] shrink-0">
        <h3 className="font-serif text-[18px] font-bold tracking-tight text-[oklch(0.20_0.02_260)]">
          Olympiad Formatting
        </h3>
        <p className="text-[12px] text-[oklch(0.45_0.02_260)] mt-1">
          Standard Markdown for text, LaTeX for math and physics.
        </p>
      </div>

      <div className="p-5 overflow-y-auto space-y-8">
        
        {/* MATH (AMC/AIME) */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E85D04] mb-3">
            Math (AMC / AIME)
          </h4>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Fractions</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\frac&#123;a&#125;&#123;b&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Combinatorics (nCr)</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\binom&#123;n&#125;&#123;k&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Modular Arithmetic</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\pmod&#123;m&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Floor / Ceiling</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\lfloor x \rfloor</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Degrees</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">90^\circ</code>
            </div>
          </div>
        </div>

        {/* PHYSICS (F=ma / USAPhO) */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0077B6] mb-3">
            Physics (F=ma / USAPhO)
          </h4>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Vectors (Arrow)</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\vec&#123;v&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Unit Vectors (Hat)</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\hat&#123;i&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Derivatives</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\frac&#123;dv&#125;&#123;dt&#125;</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Integrals</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\int_0^t</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Greek Variables</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\alpha, \omega, \tau</code>
            </div>
          </div>
        </div>

        {/* COMPUTER SCIENCE (USACO) */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] mb-3">
            USACO / Comp Sci
          </h4>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Inline Code</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">`int x = 5;`</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">C++ Code Block</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">```cpp code ```</code>
            </div>
            <div className="flex justify-between items-center border-b border-[oklch(0.95_0.01_85)] pb-2">
              <span className="text-[oklch(0.20_0.02_260)]">Time Complexity</span>
              <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[12px]">\mathcal&#123;O&#125;(N \log N)</code>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}