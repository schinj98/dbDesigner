// inspector/InspectorPanel.jsx

import { Table2, X, Info, Key, List, Tag, Hash, Fingerprint, Trash2 } from "lucide-react";

export default function InspectorPanel({ selectedNode, onUpdateNode, onClose, nodes, edges }) {
  if (!selectedNode) return null;

  const nodeData = selectedNode.data;
  const currentColor = nodeData.color || "#3b82f6";

  // Handler for inline table name change
  const handleLabelChange = (newLabel) => {
    if (newLabel.trim() && newLabel !== nodeData.label) {
      onUpdateNode(selectedNode.id, { label: newLabel });
    }
  };

  // Handler for column property update (e.g., changing constraints)
  const handleColumnUpdate = (colId, field, value) => {
    const updatedColumns = nodeData.columns.map(col => 
      col.id === colId ? { ...col, [field]: value } : col
    );
    onUpdateNode(selectedNode.id, { columns: updatedColumns });
  };
  
  // Handler for column deletion
  const handleColumnDelete = (colId) => {
    const updatedColumns = nodeData.columns.filter(col => col.id !== colId);
    onUpdateNode(selectedNode.id, { columns: updatedColumns });
  };
  

  // --- Relations Logic for Inspector ---
  // 1. Primary Keys
  const primaryKeys = nodeData.columns.filter(c => c.isPrimary);
  
  // 2. Incoming Foreign Keys (from other tables to this table)
  const incomingFKs = [];
  edges.filter(e => e.target === selectedNode.id).forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode) {
        // Find the column in the target table that acts as the foreign key
        const fkColumn = nodeData.columns.find(c => c.name.toLowerCase() === `${sourceNode.data.label.toLowerCase()}_id`);
        
        incomingFKs.push({
            sourceLabel: sourceNode.data.label,
            fkColumn: fkColumn ? fkColumn.name : 'Unknown FK Column',
        });
    }
  });


  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-5 border-b border-slate-700 pb-4">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Table2 className="w-6 h-6" style={{ color: currentColor }} />
          Inspector
        </h2>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700 transition"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Table Metadata & Notes (Feature 11/12) */}
      <div className="bg-slate-800 p-4 rounded-lg mb-4 space-y-3">
        <h3 className="text-slate-300 font-semibold flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-400" /> General
        </h3>
        
        {/* Name/Label */}
        <div className="space-y-1">
          <label className="text-slate-400 text-xs font-medium">Table Name</label>
          <input
            type="text"
            value={nodeData.label}
            onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
            onBlur={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-slate-900 text-white p-2 rounded-lg text-sm border border-slate-700 focus:ring-blue-500 focus:border-blue-500"
            style={{ '--tw-ring-color': currentColor }}
          />
        </div>
        
        {/* Notes/Comments (Feature 12 integration point) */}
        <div className="space-y-1">
          <label className="text-slate-400 text-xs font-medium flex items-center gap-1">
            <Tag className="w-3 h-3 text-yellow-500" /> Notes / Comment
          </label>
          <textarea
            rows="2"
            value={nodeData.notes || ''}
            onChange={(e) => onUpdateNode(selectedNode.id, { notes: e.target.value })}
            placeholder="Add comments or documentation..."
            className="w-full bg-slate-900 text-white p-2 rounded-lg text-sm border border-slate-700 resize-none"
          />
        </div>
      </div>
      
      {/* Columns List (PK/FK/Nullable Quick Edits) */}
      <div className="bg-slate-800 p-4 rounded-lg mb-4">
        <h3 className="text-slate-300 font-semibold flex items-center gap-2 mb-3">
          <List className="w-4 h-4 text-emerald-400" /> Columns ({nodeData.columns?.length || 0})
        </h3>
        
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {nodeData.columns.map((col) => (
            <div key={col.id} className="bg-slate-700 p-3 rounded-lg text-sm border border-slate-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-white font-medium">{col.name}</span>
                    <span className="text-slate-400 text-xs ml-2">({col.type})</span>
                </div>
                
                <button 
                  onClick={() => handleColumnDelete(col.id)} 
                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                  title="Delete Column"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs font-medium mt-1 border-t border-slate-600 pt-2">
                {/* PK Toggle */}
                <label className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded cursor-pointer">
                    PK
                    <input
                      type="checkbox"
                      checked={col.isPrimary}
                      onChange={(e) => handleColumnUpdate(col.id, 'isPrimary', e.target.checked)}
                      className="form-checkbox w-3 h-3 text-yellow-500 rounded border-slate-600 bg-slate-800"
                    />
                </label>
                
                {/* Unique Toggle */}
                <label className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded cursor-pointer">
                    Unique
                    <input
                      type="checkbox"
                      checked={col.isUnique}
                      onChange={(e) => handleColumnUpdate(col.id, 'isUnique', e.target.checked)}
                      className="form-checkbox w-3 h-3 text-orange-500 rounded border-slate-600 bg-slate-800"
                    />
                </label>

                {/* Nullable Toggle */}
                <label className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded cursor-pointer">
                    NOT NULL
                    <input
                      type="checkbox"
                      checked={!col.isNullable}
                      onChange={(e) => handleColumnUpdate(col.id, 'isNullable', !e.target.checked)}
                      className="form-checkbox w-3 h-3 text-red-500 rounded border-slate-600 bg-slate-800"
                    />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Relations Summary (FK/PK) */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-slate-300 font-semibold flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-purple-400" /> Keys & References
        </h3>
        
        <h4 className="text-white text-sm font-medium mb-1 flex items-center gap-1">
            <Key className="w-3 h-3 text-yellow-400" /> Primary Key(s):
        </h4>
        <p className="text-slate-400 text-xs mb-3">
            {primaryKeys.length > 0 ? primaryKeys.map(c => c.name).join(', ') : 'No PK defined.'}
        </p>

        <h4 className="text-white text-sm font-medium mb-1 border-t border-slate-700 pt-2 flex items-center gap-1">
            <Hash className="w-3 h-3 text-purple-400" /> Incoming Foreign Keys:
        </h4>
        <div className="space-y-1">
          {incomingFKs.length > 0 ? (
            incomingFKs.map((rel, index) => (
              <p key={index} className="text-white text-xs bg-slate-700 px-2 py-1 rounded">
                **{rel.fkColumn}** referenced by **{rel.sourceLabel}**
              </p>
            ))
          ) : (
            <p className="text-slate-500 text-xs">No tables referencing this one directly.</p>
          )}
        </div>
      </div>
    </div>
  );
}