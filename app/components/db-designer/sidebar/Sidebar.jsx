import { Database, Table2, Key, Grid, FileCode } from "lucide-react";

export default function Sidebar({ 
  onAddTable, 
  onRelationMode, 
  isRelationMode, 
  onAutoLayout, 
  onGenerateSQL 
}) {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-2">
      <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-500" />
        DB Designer
      </h2>

      <button
        onClick={onAddTable}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-md"
      >
        <Table2 className="w-5 h-5" />
        Add Table
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
