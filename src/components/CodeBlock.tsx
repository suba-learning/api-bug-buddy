import { useEffect, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="relative group">
      <pre className="code-block whitespace-pre-wrap break-all">{code}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); }}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background/20 hover:bg-background/40 text-white opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
