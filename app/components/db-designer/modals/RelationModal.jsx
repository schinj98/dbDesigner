import { X } from "lucide-react";
import { useState } from "react";

export default function RelationModal({
  isOpen,
  onClose,
  onSelect,
  sourceTable,
  targetTable,
}) {
  const [cardinality, setCardinality] = useState("one-to-many");
  const [relationName, setRelationName] = useState("");

  if (!isOpen) return null;

  const handleSelect = () => {
    let type = "";

    if (cardinality === "one-to-one") type = "One-to-One (1:1)";
    if (cardinality === "one-to-many") type = "One-to-Many (1:N)";
    if (cardinality === "many-to-many") type = "Many-to-Many (M:N)";

    onSelect(type, relationName, cardinality);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-[450px]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">Configure Relation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABLES */}
        <div className="bg-slate-700 p-3 rounded mb-4 text-sm text-slate-300">
          <span className="text-blue-400 font-semibold">{sourceTable}</span>
          {" → "}
          <span className="text-green-400 font-semibold">{targetTable}</span>
        </div>

        {/* RELATION NAME */}
        <label className="text-slate-300 text-sm mb-1 block">
          Relation Name (optional)
        </label>
        <input
          value={relationName}
          onChange={(e) => setRelationName(e.target.value)}
          placeholder="e.g. user_orders"
          className="w-full bg-slate-700 text-white px-3 py-2 mb-4 rounded-lg"
        />

        {/* CARDINALITIES */}
        <div className="space-y-2 mb-4">
          {/* 1:1 */}
          <button
            onClick={() => setCardinality("one-to-one")}
            className={`px-4 py-3 w-full rounded-lg text-left ${
              cardinality === "one-to-one"
                ? "bg-purple-600 ring-2 ring-purple-400 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <div className="font-semibold">One-to-One (1:1)</div>
            <div className="text-xs opacity-80">
              One row in A = One row in B
            </div>
          </button>

          {/* 1:N */}
          <button
            onClick={() => setCardinality("one-to-many")}
            className={`px-4 py-3 w-full rounded-lg text-left ${
              cardinality === "one-to-many"
                ? "bg-blue-600 ring-2 ring-blue-400 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <div className="font-semibold">One-to-Many (1:N)</div>
            <div className="text-xs opacity-80">
              One row in A → Many rows in B
            </div>
          </button>

          {/* M:N */}
          <button
            onClick={() => setCardinality("many-to-many")}
            className={`px-4 py-3 w-full rounded-lg text-left ${
              cardinality === "many-to-many"
                ? "bg-green-600 ring-2 ring-green-400 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <div className="font-semibold">Many-to-Many (M:N)</div>
            <div className="text-xs opacity-80">
              Many rows in A ↔ Many rows in B
            </div>
          </button>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={handleSelect}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create Relation
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
