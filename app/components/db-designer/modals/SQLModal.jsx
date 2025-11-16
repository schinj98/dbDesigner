import { X, FileCode, Copy } from "lucide-react";
import { useState } from "react";

export default function SQLModal({ isOpen, onClose, sql }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 w-full max-w-3xl rounded-lg border border-slate-700 p-6 shadow-lg flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-500" />
            Generated SQL
          </h3>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SQL OUTPUT */}
        <div className="bg-slate-900 p-4 rounded-lg overflow-auto flex-1 mb-4">
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
            {sql || "-- Nothing to generate."}
          </pre>
        </div>

        {/* COPY BUTTON */}
        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
    </div>
  );
}
