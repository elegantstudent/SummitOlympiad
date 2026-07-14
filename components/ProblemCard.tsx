"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface ProblemCardProps {
  questionMd: string;
  exactAnswer: string;
  solutionMd: string;
  accentColor: string;
  isSolved: boolean;
  onSolve: () => void;
}

export default function ProblemCard({
  questionMd,
  exactAnswer,
  solutionMd,
  accentColor,
  isSolved,
  onSolve,
}: ProblemCardProps) {
  const [userInput, setUserInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sync state cleanly whenever a new problem mounts or loads from the database
  useEffect(() => {
    if (isSolved) {
      setIsCorrect(true);
      setShowFeedback(true);
      setUserInput(exactAnswer); // Show the correct answer in the box if solved
    } else {
      setIsCorrect(false);
      setShowFeedback(false);
      setUserInput("");
    }
  }, [isSolved, questionMd, exactAnswer]);

  const validateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const isAnswerCorrect = userInput.trim().toLowerCase() === exactAnswer.trim().toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (isAnswerCorrect) {
      onSolve(); // Pass message up to parent page to save in Supabase
    }
  };

  return (
    <div className="space-y-8">
      {/* Question Presentation Frame */}
      <div className="prose prose-slate max-w-none text-[16px] leading-relaxed text-[oklch(0.20_0.02_260)] font-sans">
        <MarkdownRenderer content={questionMd} />
      </div>

      {/* Interactive Submission Form */}
      <form onSubmit={validateAnswer} className="space-y-4 max-w-md">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold tracking-wider text-[oklch(0.45_0.02_260)] ml-1">
            Submit Numerical or Exact Solution
          </label>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isSolved}
              placeholder={isSolved ? "Problem completed" : "Type your answer..."}
              className="flex-1 border border-[oklch(0.90_0.01_85)] rounded-md px-4 py-2.5 text-[14px] outline-none focus:border-[oklch(0.20_0.02_260)] transition-colors disabled:bg-slate-50 disabled:text-slate-500 font-sans"
            />
            
            {!isSolved && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-md text-[14px] font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap font-sans"
                style={{ backgroundColor: accentColor }}
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dynamic Results & Feedback Messaging */}
      {showFeedback && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {isCorrect ? (
            <div className="border border-emerald-100 bg-emerald-50/60 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-sans text-[14px] font-semibold">
                <span>✓ Correct! Great job.</span>
              </div>
              
              {/* Solution breakdown panel */}
              <div className="border-t border-emerald-100/70 pt-4 space-y-2">
                <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-600/80 font-sans">
                  Official Solution
                </p>
                <div className="prose prose-emerald max-w-none text-[15px] leading-relaxed text-slate-700 font-sans">
                  <MarkdownRenderer content={solutionMd} />
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-red-100 bg-red-50/50 rounded-lg px-4 py-3 text-red-700 font-sans text-[14px]">
              Incorrect answer. Double-check your work and try again!
            </div>
          )}
        </div>
      )}
    </div>
  );
}