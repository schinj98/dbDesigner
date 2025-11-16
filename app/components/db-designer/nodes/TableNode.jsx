// nodes/tablenode.jsx (Complete Updated File)

import { useState, useRef, useEffect } from "react";
import { Table2, Key, Link2, Plus, Trash2, Copy, Mail, Calendar, DollarSign, Fingerprint, Palette, Check, X } from "lucide-react";

// Helper function for smart type suggestion
const getSmartSuggestion = (name) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("id") && !lowerName.includes("_at")) return "INT";
  if (lowerName.includes("email")) return "VARCHAR(255) UNIQUE";
  if (lowerName.includes("created_at") || lowerName.includes("updated_at") || lowerName.includes("date")) return "TIMESTAMP";
  if (lowerName.includes("price") || lowerName.includes("amount")) return "DECIMAL(10, 2)";
  if (lowerName.includes("is_")) return "BOOLEAN";
  if (lowerName.includes("url") || lowerName.includes("slug")) return "VARCHAR(255)";
  if (lowerName.includes("description") || lowerName.includes("content")) return "TEXT";

  return "VARCHAR(255)";
};

// Helper function to get icon with improved styling
const getIcon = (col) => {
  if (col.isPrimary) return <Key className="w-3.5 h-3.5 text-yellow-400" />;
  if (col.isForeign) return <Link2 className="w-3.5 h-3.5 text-purple-400" />;
  if (col.isUnique) return <Fingerprint className="w-3.5 h-3.5 text-orange-400" />;

  const lowerType = col.type.toLowerCase();
  if (lowerType.includes('email')) return <Mail className="w-3.5 h-3.5 text-blue-400" />;
  if (lowerType.includes('date') || lowerType.includes('timestamp')) return <Calendar className="w-3.5 h-3.5 text-green-400" />;
  if (lowerType.includes('decimal')) return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
  
  return null;
}

export default function TableNode({ data }) {
  const id = data.nodeId;
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(data.label || "New Table");
  const [columns, setColumns] = useState(data.columns || []);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);
  
  // Feature 10 Fix: Derive color from data or use default
  const currentColor = data.color || "#3b82f6";

  const [newColumn, setNewColumn] = useState({
    name: "",
    type: "VARCHAR(255)",
    isPrimary: false,
    isForeign: false,
    isUnique: false,
    isNullable: true,
    defaultValue: "",
  });

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  // Color Change Handler - Fixed to properly update
  const handleColorChange = (newColor) => {
    if (data.onUpdate) {
      data.onUpdate(id, { 
        label: tableName,
        columns: columns,
        color: newColor 
      });
    }
    setShowColorPicker(false);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const suggestedType = getSmartSuggestion(name);

    setNewColumn(prev => ({ 
        ...prev, 
        name,
        type: suggestedType
    }));
  };

  const handleAddColumn = () => {
    if (!newColumn.name) return;

    const updatedColumns = [
      ...columns,
      { ...newColumn, id: Date.now() }
    ];

    setColumns(updatedColumns);

    if (data.onUpdate) {
      data.onUpdate(id, {
        columns: updatedColumns,
        label: tableName,
        color: currentColor,
      });
    }

    setNewColumn({
      name: "",
      type: "VARCHAR(255)",
      isPrimary: false,
      isForeign: false,
      isUnique: false,
      isNullable: true,
      defaultValue: "",
    });

    setShowAddColumn(false);
  };

  const handleDeleteColumn = (colId) => {
    const updatedColumns = columns.filter((c) => c.id !== colId);
    setColumns(updatedColumns);
    if (data.onUpdate) {
      data.onUpdate(id, { columns: updatedColumns, label: tableName, color: currentColor });
    }
  };

  const handleTableNameChange = () => {
    if (data.onUpdate) {
      data.onUpdate(id, { label: tableName, columns, color: currentColor });
    }
    setIsEditing(false);
  };

  const handleDuplicate = () => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
  };
  
  // Dynamic gradient with glow effect
  const headerStyle = {
    background: `linear-gradient(135deg, ${currentColor}DD 0%, ${currentColor}99 50%, ${currentColor}CC 100%)`,
    boxShadow: `0 4px 20px ${currentColor}40`,
  };

  // Predefined color palette (Feature 10) - Moved here for local use
  const COLOR_SWATCHES = [
    '#3b82f6', // Blue (Default/Auth)
    '#f97316', // Orange (Ecommerce)
    '#10b981', // Green (Financial)
    '#ef4444', // Red (Security)
    '#8b5cf6', // Purple (Content)
    '#eab308', // Yellow
    '#64748b', // Slate
    '#ec4899', // Pink
  ];

  return (
    <div
      className={`bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-2xl border-2 min-w-[320px] transition-all duration-300 ${
        data.isHighlighted
          ? "border-yellow-400 ring-4 ring-yellow-400/50 scale-105"
          : "border-slate-700 hover:border-slate-600"
      }`}
    >
      {/* Enhanced Header with gradient and glow */}
      <div 
        className="px-4 py-3.5 rounded-t-xl flex justify-between items-center relative backdrop-blur-sm"
        style={headerStyle}
      >
        {/* Table Name */}
        <div className="flex gap-2.5 items-center flex-1">
          <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
            <Table2 className="text-white w-5 h-5 drop-shadow-lg" />
          </div>

          {isEditing ? (
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onBlur={handleTableNameChange}
              onKeyDown={(e) => e.key === "Enter" && handleTableNameChange()}
              className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm flex-1 focus:ring-2 focus:ring-white/30 focus:outline-none backdrop-blur-sm font-semibold"
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className="text-white font-bold text-base cursor-pointer hover:text-white/90 transition-colors drop-shadow-md"
            >
              {tableName}
            </h3>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center" ref={colorPickerRef}>
            {/* Color Picker Toggle (Feature 10) */}
            <button
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all backdrop-blur-sm relative z-50"
                onClick={() => setShowColorPicker(prev => !prev)}
                title="Change color"
            >
                <Palette className="w-4 h-4" style={{ color: currentColor }} />
            </button>
            
            <button
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all backdrop-blur-sm"
                onClick={handleDuplicate}
                title="Duplicate table"
            >
                <Copy className="w-4 h-4" />
            </button>

            <button
                className="text-white/80 hover:text-red-300 bg-white/10 hover:bg-red-500/20 p-1.5 rounded-lg transition-all backdrop-blur-sm"
                onClick={() => data.onDelete?.(id)}
                title="Delete table"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Color Picker Swatches (Feature 10) */}
            {showColorPicker && (
                <div className="absolute top-full right-0 mt-3 p-2 bg-slate-700 rounded-lg shadow-xl flex flex-wrap gap-1 z-[60] border border-slate-600 min-w-[120px]">
                    {COLOR_SWATCHES.map((color) => (
                        <button
                            key={color}
                            className="w-5 h-5 rounded-full border-2 transition-all"
                            style={{ backgroundColor: color, borderColor: color === currentColor ? 'white' : 'transparent' }}
                            onClick={() => handleColorChange(color)}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Columns List */}
      <div className="p-3 max-h-[420px] overflow-y-auto custom-scrollbar">
        {columns.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Table2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No columns yet</p>
            <p className="text-xs mt-1">Click "Add Column" to start</p>
          </div>
        ) : (
          columns.map((col, index) => (
            <div
              key={col.id}
              className="bg-slate-700/50 hover:bg-slate-700/70 px-3 py-2.5 rounded-lg mb-2 group transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-2.5 items-center flex-1">
                  {getIcon(col)} 
                  <span className="text-white text-sm font-semibold">{col.name}</span>
                  <span className="text-slate-400 text-xs bg-slate-800/50 px-2 py-0.5 rounded">
                    {col.type}
                  </span>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 hover:bg-red-500/10 rounded"
                  onClick={() => handleDeleteColumn(col.id)}
                  title="Delete column"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badges for constraints */}
              {(col.isPrimary || col.isUnique || !col.isNullable) && (
                <div className="flex gap-1.5 mt-2">
                  {col.isPrimary && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                      PRIMARY KEY
                    </span>
                  )}
                  {col.isUnique && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                      UNIQUE
                    </span>
                  )}
                  {!col.isNullable && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                      NOT NULL
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Add Column Button */}
        <button
          onClick={() => setShowAddColumn(!showAddColumn)}
          className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-2.5 rounded-lg mt-2 flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-lg hover:shadow-xl"
          style={{
            boxShadow: showAddColumn ? `0 0 0 2px ${currentColor}40` : ''
          }}
        >
          {showAddColumn ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddColumn ? 'Cancel' : 'Add Column'}
        </button>

        {/* Add Column Form */}
        {showAddColumn && (
          <div className="bg-slate-700/80 backdrop-blur-sm p-4 rounded-lg mt-2 space-y-3 border border-slate-600 shadow-xl">
            <input
              type="text"
              placeholder="Column name (e.g., user_email)"
              value={newColumn.name}
              onChange={handleNameChange} 
              className="w-full bg-slate-800/90 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:outline-none border border-slate-600 focus:border-slate-500"
              style={{ '--tw-ring-color': currentColor }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Data type (e.g., VARCHAR(255))"
              value={newColumn.type}
              onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-slate-800/90 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:outline-none border border-slate-600 focus:border-slate-500"
              style={{ '--tw-ring-color': currentColor }}
            />
            
            <div className="flex flex-wrap gap-2 text-sm text-white">
              <label className="flex items-center gap-2 bg-slate-600/70 hover:bg-slate-600 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={newColumn.isPrimary}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="form-checkbox text-yellow-500 rounded"
                />
                <span className="font-medium">Primary Key</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-600/70 hover:bg-slate-600 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={!newColumn.isNullable}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, isNullable: !e.target.checked }))}
                  className="form-checkbox text-red-500 rounded"
                />
                <span className="font-medium">NOT NULL</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-600/70 hover:bg-slate-600 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={newColumn.isUnique}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, isUnique: e.target.checked }))}
                  className="form-checkbox text-orange-500 rounded"
                />
                <span className="font-medium">UNIQUE</span>
              </label>
            </div>

            <button
              onClick={handleAddColumn}
              disabled={!newColumn.name}
              className="w-full bg-gradient-to-r text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: newColumn.name 
                  ? `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}CC 100%)`
                  : 'rgb(71 85 105)',
              }}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Confirm Add Column
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${currentColor}60;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${currentColor}90;
        }
      `}</style>
    </div>
  );
}