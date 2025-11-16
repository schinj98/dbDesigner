import { useState } from "react";
import { Table2, Key, Link2, Plus, Trash2, Copy } from "lucide-react";

export default function TableNode({ data, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(data.label || "New Table");
  const [columns, setColumns] = useState(data.columns || []);
  const [showAddColumn, setShowAddColumn] = useState(false);

  const [newColumn, setNewColumn] = useState({
    name: "",
    type: "VARCHAR",
    isPrimary: false,
    isForeign: false,
    isUnique: false,
    isNullable: true,
    defaultValue: "",
  });

  const handleAddColumn = () => {
    if (!newColumn.name) return;

    const updatedColumns = [
      ...columns,
      { ...newColumn, id: Date.now() }
    ];

    setColumns(updatedColumns);

    data.onUpdate?.(id, {
      columns: updatedColumns,
      label: tableName,
    });

    setNewColumn({
      name: "",
      type: "VARCHAR",
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
    data.onUpdate?.(id, { columns: updatedColumns, label: tableName });
  };

  const handleTableNameChange = () => {
    data.onUpdate?.(id, { label: tableName, columns });
    setIsEditing(false);
  };

  const handleDuplicate = () => data.onDuplicate?.(id);

  return (
    <div
      className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl border-2 min-w-[300px] transition-all ${
        data.isHighlighted
          ? "border-yellow-400 ring-4 ring-yellow-400/50 scale-105"
          : "border-slate-600"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg flex justify-between items-center">
        {/* Name */}
        <div className="flex gap-2 items-center flex-1">
          <Table2 className="text-white w-5 h-5" />

          {isEditing ? (
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onBlur={handleTableNameChange}
              onKeyDown={(e) => e.key === "Enter" && handleTableNameChange()}
              className="bg-blue-800 text-white px-2 py-1 rounded text-sm flex-1"
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={() => setIsEditing(true)}
              className="text-white font-semibold cursor-pointer"
            >
              {tableName}
            </h3>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="text-white/70 hover:text-white"
            onClick={handleDuplicate}
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            className="text-white/70 hover:text-red-300"
            onClick={() => data.onDelete?.(id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="p-2 max-h-[400px] overflow-y-auto">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-slate-700/60 px-3 py-2 rounded mb-2 group hover:bg-slate-700 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                {col.isPrimary && (
                  <Key className="w-3 h-3 text-yellow-400" />
                )}
                {col.isForeign && (
                  <Link2 className="w-3 h-3 text-purple-400" />
                )}
                <span className="text-white text-sm">{col.name}</span>
                <span className="text-slate-400 text-xs">{col.type}</span>
              </div>

              <button
                className="opacity-0 group-hover:opacity-100 transition"
                onClick={() => handleDeleteColumn(col.id)}
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>

            {col.defaultValue && (
              <p className="text-xs text-slate-400">
                Default: {col.defaultValue}
              </p>
            )}
          </div>
        ))}

        {/* Add Column Button */}
        {!showAddColumn && (
          <button
            onClick={() => setShowAddColumn(true)}
            className="w-full flex justify-center gap-2 bg-slate-700/40 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded mt-2"
          >
            <Plus className="w-4 h-4" /> Add Column
          </button>
        )}

        {/* Column Create Box */}
        {showAddColumn && (
          <div className="bg-slate-700 p-3 rounded mt-2 space-y-2">
            <input
              placeholder="Column name"
              value={newColumn.name}
              onChange={(e) =>
                setNewColumn({ ...newColumn, name: e.target.value })
              }
              className="w-full bg-slate-800 text-white rounded px-2 py-1"
            />

            <select
              value={newColumn.type}
              onChange={(e) =>
                setNewColumn({ ...newColumn, type: e.target.value })
              }
              className="w-full bg-slate-800 text-white rounded px-2 py-1"
            >
              <option>VARCHAR</option>
              <option>INT</option>
              <option>BIGINT</option>
              <option>TEXT</option>
              <option>DATE</option>
              <option>BOOLEAN</option>
              <option>JSON</option>
            </select>

            <div className="grid grid-cols-2 gap-2 text-white text-xs">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={newColumn.isPrimary}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, isPrimary: e.target.checked })
                  }
                />
                Primary Key
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={newColumn.isForeign}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, isForeign: e.target.checked })
                  }
                />
                Foreign Key
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={newColumn.isUnique}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, isUnique: e.target.checked })
                  }
                />
                Unique
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={!newColumn.isNullable}
                  onChange={(e) =>
                    setNewColumn({
                      ...newColumn,
                      isNullable: !e.target.checked,
                    })
                  }
                />
                NOT NULL
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddColumn}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded"
              >
                Add
              </button>

              <button
                onClick={() => setShowAddColumn(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
