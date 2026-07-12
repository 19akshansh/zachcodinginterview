"use client";

import Editor, { type OnMount, type OnChange } from "@monaco-editor/react";
import { useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ProgrammingLanguage } from "@/config/enums";

const MONACO_LANGUAGE_IDS: Record<ProgrammingLanguage, string> = {
  [ProgrammingLanguage.PYTHON]: "python",
  [ProgrammingLanguage.JAVASCRIPT]: "javascript",
  [ProgrammingLanguage.TYPESCRIPT]: "typescript",
  [ProgrammingLanguage.JAVA]: "java",
  [ProgrammingLanguage.CPP]: "cpp",
  [ProgrammingLanguage.GO]: "go",
  [ProgrammingLanguage.RUST]: "rust",
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: ProgrammingLanguage;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

export const CodeEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
  className,
  height = "100%",
}: CodeEditorProps) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    const textarea = editor.getDomNode()?.querySelector("textarea");
    textarea?.setAttribute("spellcheck", "false");
  };

  const handleChange: OnChange = (nextValue) => {
    onChange(nextValue ?? "");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-[#1e1e1e] flex-1 min-h-0",
        className,
      )}
    >
      <Editor
        height={height}
        theme="vs-dark"
        language={MONACO_LANGUAGE_IDS[language] ?? "plaintext"}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        loading={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Loading editor...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-geist-mono), monospace",
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          tabSize: 2,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "gutter",
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
};
