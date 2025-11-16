// nodes/NoteNode.jsx

import { StickyNote, Trash2 } from "lucide-react";
import { useState } from "react";

export default function NoteNode({ data, id }) {
  const [content, setContent] = useState(data.content || "Click to edit note...");
  const [isEditing, setIsEditing] = useState(false);
  const noteColor = data.color || '#eab308'; // Default Yellow

  // Save changes back to the canvas state
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onUpdate?.(id, { content: content, color: noteColor });
  };
  
  const handleColorChange = (newColor) => {
    data.onUpdate?.(id, { content: content, color: newColor });
  };

  return (
    <div 
      className="w-64 h-40 rounded-xl shadow-xl p-3 border-2 border-slate-700/50 flex flex-col"
      style={{ 
        backgroundColor: noteColor, 
        borderColor: noteColor 
      }}
    >
      {/* Note Header */}
      <div className="flex justify-between items-center pb-2 border-b border-black/10">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-black/70" />
          <span className="text-sm font-semibold text-black/70">Note Card</span>
        </div>
        <button
          onClick={() => data.onDelete?.(id)}
          className="text-black/70 hover:text-red-700 p-1 rounded transition-colors"
          title="Delete Note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 mt-2">
        {isEditing ? (
          <textarea
            value={content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            className="w-full h-full p-1 text-sm bg-transparent border-none resize-none focus:outline-none text-black placeholder-black/50"
            autoFocus
          />
        ) : (
          <p
            onDoubleClick={() => setIsEditing(true)}
            className="w-full h-full p-1 text-sm cursor-text text-black/90 whitespace-pre-wrap overflow-hidden"
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
}