"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none text-[oklch(0.45_0.02_260)] font-sans leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom styling for paragraphs to match your editorial vibe
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          // Custom styling for bold text
          strong: ({ node, ...props }) => <strong className="font-semibold text-[oklch(0.20_0.02_260)]" {...props} />,
          // Make sure math blocks scroll horizontally on mobile if they are too long
          div: ({ node, className, ...props }) => {
            if (className?.includes("math-display")) {
              return <div className="overflow-x-auto py-2" {...props} />;
            }
            return <div className={className} {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}