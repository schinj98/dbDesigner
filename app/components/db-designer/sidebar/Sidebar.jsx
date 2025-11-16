// sidebar/Sidebar.jsx

import { Database, Table2, Key, Grid, FileCode, StickyNote } from "lucide-react"; // Imported StickyNote
import { TEMPLATES } from "../utils/TableTemplates"; 

export default function Sidebar({ 
  onAddTable, 
  onRelationMode, 
  isRelationMode, 
  onAutoLayout, 
  onGenerateSQL,
  onAddNote // NEW PROP
}) {
  
  // Handle Drag Start for Templates
  const onDragStart = (event, templateId) => {
    event.dataTransfer.setData('application/reactflow', 'templateNode');
    event.dataTransfer.setData('templateId', templateId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-500" />
        DB Designer
      </h2>

      {/* Primary Actions */}
      <button
        onClick={onAddTable}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-md"
      >
        <Table2 className="w-5 h-5" />
        Add Empty Table
      </button>
      <button
        onClick={onAddNote} // NEW BUTTON
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-md"
      >
        <StickyNote className="w-5 h-5" />
        Add Sticky Note
      </button>
      <button
        onClick={onRelationMode}
        className={`${
          isRelationMode
            ? "bg-yellow-600"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-md`}
      >
        <Key className="w-5 h-5" />
        {isRelationMode ? "Cancel Relation" : "Create Relation"}
      </button>

      <div className="border-t border-slate-700 my-2" />

      {/* --- Table Templates Library (New Feature 5) --- */}
      <h3 className="text-slate-400 font-semibold mb-1 mt-2">Templates Library</h3>
      <div className="flex flex-col gap-2">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg cursor-grab border border-slate-700 transition-colors"
            draggable
            onDragStart={(event) => onDragStart(event, template.id)}
          >
            <div className="flex items-center gap-2">
                <div 
                    className="w-3 h-3 rounded-full" 
                    style={{backgroundColor: template.color}}
                />
                <span className="font-medium text-sm">{template.label}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{template.description}</p>
          </div>
        ))}
      </div>
      
      <div className="border-t border-slate-700 my-2" />

      {/* Utility Actions */}
      <button
        onClick={onAutoLayout}
        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Grid className="w-4 h-4" />
        Auto Layout
      </button>

      <button
        onClick={onGenerateSQL}
        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <FileCode className="w-4 h-4" />
        Generate SQL
      </button>

      <div className="mt-auto pt-4 border-t border-slate-700">
        <p className="text-slate-400 text-xs">Shortcuts:</p>
        <ul className="text-slate-500 text-xs mt-1 space-y-1">
          <li>• Double-click to edit</li>
          <li>• Drag to move</li>
          <li>• Ctrl+Z to undo</li>
          <li>• Ctrl+S to save</li>
        </ul>
      </div>
    </div>
  );
}