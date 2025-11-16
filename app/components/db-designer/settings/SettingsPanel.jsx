import { Settings, X, Table2, Download, Upload } from "lucide-react";

export default function SettingsPanel({
  isOpen,
  onClose,
  nodes,
  edges,
  onExport,
  onImport
}) {
  if (!isOpen) return null;

  const tableCount = nodes.length;
  const relationCount = edges.length;
  const totalColumns = nodes.reduce(
    (sum, node) => sum + (node.data.columns?.length || 0),
    0
  );

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          Diagram Info
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Export / Import */}
      <div className="bg-slate-800 p-4 rounded-lg mb-4">
        <h3 className="text-slate-300 font-semibold mb-3">Actions</h3>

        <div className="space-y-2">
          <button
            onClick={onExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>

          <button
            onClick={onImport}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import JSON
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-slate-800 p-4 rounded-lg mb-4">
        <h3 className="text-slate-300 font-semibold mb-3">Statistics</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Tables:</span>
            <span className="text-white font-medium">{tableCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Relations:</span>
            <span className="text-white font-medium">{relationCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Columns:</span>
            <span className="text-white font-medium">{totalColumns}</span>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-slate-800 p-4 rounded-lg mb-4">
        <h3 className="text-slate-300 font-semibold mb-3">Tables</h3>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="bg-slate-700 p-3 rounded text-sm flex items-center gap-2"
            >
              <Table2 className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white font-medium">{node.data.label}</p>
                <p className="text-slate-400 text-xs">
                  {node.data.columns?.length || 0} columns
                </p>
              </div>
            </div>
          ))}

          {tableCount === 0 && (
            <p className="text-slate-500 text-xs text-center py-4">
              No tables yet
            </p>
          )}
        </div>
      </div>

      {/* Relations */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-slate-300 font-semibold mb-3">Relations</h3>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source)?.data.label;
            const tgt = nodes.find((n) => n.id === edge.target)?.data.label;

            return (
              <div key={edge.id} className="p-3 bg-slate-700 rounded text-sm">
                <p className="text-white font-medium">
                  {src} → {tgt}
                </p>
                <p className="text-slate-400 text-xs">
                  {edge.data?.relationType || "Relation"}
                </p>
                {edge.label && (
                  <p className="text-blue-400 text-xs mt-1">{edge.label}</p>
                )}
              </div>
            );
          })}

          {relationCount === 0 && (
            <p className="text-slate-500 text-xs text-center py-3">
              No relations yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
