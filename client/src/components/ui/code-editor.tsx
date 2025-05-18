import React from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  highlightType?: "optimization" | "security" | "none";
  readOnly?: boolean;
  onChange?: (code: string) => void;
  className?: string;
}

export function CodeEditor({
  code,
  language = "javascript",
  filename,
  highlightLines = [],
  highlightType = "none",
  readOnly = true,
  onChange,
  className,
}: CodeEditorProps) {
  const lines = code.split("\n");

  // Highlights specific lines with predefined styles
  const getLineClass = (index: number) => {
    if (!highlightLines.includes(index + 1)) return "";
    
    switch (highlightType) {
      case "optimization":
        return "optimization-highlight px-3 -mx-3";
      case "security":
        return "security-highlight px-3 -mx-3";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={cn("bg-editor-bg rounded-md overflow-hidden", className)}>
      {/* Header with file info */}
      <div className="px-4 py-2 bg-editor-surface border-b border-editor-line flex items-center justify-between">
        <div className="flex items-center">
          {language === "javascript" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.775l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.034.049zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.517-.886.451-1.175.359-.297-.146-.448-.349-.623-.641-.047-.078-.082-.146-.095-.146l-1.368.844c.229.473.563.879.994 1.137.641.383 1.502.507 2.404.305.588-.17 1.095-.519 1.358-1.059.384-.697.302-1.553.299-2.509.008-1.541 0-3.083 0-4.635l.003-.042z" />
            </svg>
          )}
          {language === "typescript" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3zm14.041 6.941c-.207-.527-.845-.638-1.452-.638-.247 0-1.347.05-1.326.639.012.346.355.546 1.173.748 1.553.384 2.76.881 2.76 2.476 0 1.301-.945 2.405-3.159 2.405-.821 0-2.33-.237-3.077-1.421l1.263-.946c.207.527.822.835 1.736.835 1.04 0 1.339-.409 1.339-.784 0-.3-.195-.536-1.137-.722-1.581-.313-2.799-.859-2.799-2.426 0-1.498 1.355-2.312 2.863-2.312.802 0 2.064.185 2.705 1.19l-1.109.955zM12 8.709H9.045v7.215h-1.68V8.709h-2.97V7.273H12v1.436z" />
            </svg>
          )}
          {language === "python" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
            </svg>
          )}
          <span className="text-xs font-medium">{language}</span>
        </div>
        {filename && (
          <div className="text-xs text-gray-500">{filename}</div>
        )}
        <div className="flex space-x-2">
          <button className="text-xs text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Code editor content */}
      <div className="px-4 py-3 code-editor flex">
        {/* Line numbers */}
        <div className="code-line-number mr-2 select-none flex-shrink-0">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        
        {/* Code content */}
        {readOnly ? (
          <div className="flex-1 overflow-x-auto">
            <pre className="text-sm">
              <code className={`language-${language}`}>
                {lines.map((line, index) => (
                  <div key={index} className={getLineClass(index)}>
                    {line || " "}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        ) : (
          <textarea
            value={code}
            onChange={handleChange}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-mono text-editor-text"
            spellCheck="false"
            rows={lines.length + 1}
          />
        )}
      </div>
    </div>
  );
}
