import { useState, useRef, useCallback, useEffect } from "react";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

// Components
import TableNode from "./nodes/TableNode";
import Sidebar from "./sidebar/Sidebar";
import SettingsPanel from "./settings/SettingsPanel";
import RelationModal from "./modals/RelationModal";
import SQLModal from "./modals/SQLModal";
import Notification from "./modals/Notification";
import ConnectingEdge from "./edges/ConnectingEdge";

// Utils
import generateSQL from "./utils/generateSQL";
import { saveHistory, undo, redo } from "./utils/history";

// Icons
import { Save, Undo, Redo, ZoomIn, ZoomOut, Maximize2, Settings } from "lucide-react";

const nodeTypes = { tableNode: TableNode };

export default function DBDesignerCanvas() {
  // Basic states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRelationMode, setIsRelationMode] = useState(false);

  const [selectedTable, setSelectedTable] = useState(null);
  const [pendingRelation, setPendingRelation] = useState(null);
  const [showRelationModal, setShowRelationModal] = useState(false);

  const [notification, setNotification] = useState({ message: "", type: "info" });

  const [sqlModal, setSQLModal] = useState(false);
  const [sqlOutput, setSQLOutput] = useState("");

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [mousePos, setMousePos] = useState(null);
  const [sourcePos, setSourcePos] = useState(null);

  const reactFlowWrapper = useRef(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Notification
  const showMsg = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification({ message: "", type: "info" }), 2300);
  };

  // Save history
  const pushHistory = (newNodes, newEdges) => {
    const { history: newHist, index } = saveHistory(history, historyIndex, newNodes, newEdges);
    setHistory(newHist);
    setHistoryIndex(index);
  };

  // Undo / Redo
  const handleUndo = () => {
    const res = undo(history, historyIndex);
    if (!res) return;
    setHistoryIndex(res.index);
    setNodes(res.state.nodes);
    setEdges(res.state.edges);
    showMsg("Undo", "success");
  };

  const handleRedo = () => {
    const res = redo(history, historyIndex);
    if (!res) return;
    setHistoryIndex(res.index);
    setNodes(res.state.nodes);
    setEdges(res.state.edges);
    showMsg("Redo", "success");
  };

  // Connect edges
  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(
        {
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#60a5fa", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
        },
        edges
      );

      setEdges(newEdges);
      pushHistory(nodes, newEdges);
    },
    [nodes, edges]
  );

  // Add Table
  const handleAddTable = () => {
    const newTable = {
      id: `table-${Date.now()}`,
      type: "tableNode",
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: `Table_${nodes.length + 1}`,
        columns: [{ id: Date.now(), name: "id", type: "INT", isPrimary: true }],
        onUpdate: handleUpdateNode,
        onDelete: handleDeleteTable,
        onDuplicate: handleDuplicateTable,
        isHighlighted: false,
      },
    };

    const updated = [...nodes, newTable];
    setNodes(updated);
    pushHistory(updated, edges);
    showMsg("Table Added", "success");
  };

  // Update Table Node
  const handleUpdateNode = (nodeId, data) => {
    const updated = nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    );
    setNodes(updated);
    pushHistory(updated, edges);
  };

  // Delete Table
  const handleDeleteTable = (id) => {
    const n = nodes.filter((x) => x.id !== id);
    const e = edges.filter((x) => x.source !== id && x.target !== id);

    setNodes(n);
    setEdges(e);
    pushHistory(n, e);
    showMsg("Table Deleted", "warning");
  };

  // Duplicate Table
  const handleDuplicateTable = (id) => {
    const src = nodes.find((n) => n.id === id);
    if (!src) return;

    const dup = {
      ...src,
      id: `table-${Date.now()}`,
      position: { x: src.position.x + 50, y: src.position.y + 50 },
      data: { ...src.data, label: src.data.label + "_copy" },
    };

    const newNodes = [...nodes, dup];
    setNodes(newNodes);
    pushHistory(newNodes, edges);
    showMsg("Duplicated", "success");
  };

  // Relation Mode On/Off
  const handleRelationMode = () => {
    setIsRelationMode((prev) => !prev);

    if (!isRelationMode) {
      showMsg("Select first table", "info");
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, isHighlighted: true } }))
      );
    } else {
      setSelectedTable(null);
      setSourcePos(null);
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, isHighlighted: false } }))
      );
    }
  };

  // Node Click Handler
  const onNodeClick = (evt, node) => {
    if (!isRelationMode) return;

    if (!selectedTable) {
      setSelectedTable(node.id);

      const rect = evt.target.getBoundingClientRect();
      setSourcePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

      showMsg("Select second table", "info");

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isHighlighted: n.id !== node.id },
        }))
      );
    } else if (node.id !== selectedTable) {
      const src = nodes.find((n) => n.id === selectedTable);

      setPendingRelation({
        source: selectedTable,
        target: node.id,
        sourceLabel: src.data.label,
        targetLabel: node.data.label,
      });

      setShowRelationModal(true);
      setSourcePos(null);
    }
  };

  // Apply Relation
  const handleRelationSelect = (type, relationName, cardinality) => {
    const color =
      cardinality === "one-to-one"
        ? "#a855f7"
        : cardinality === "one-to-many"
        ? "#60a5fa"
        : "#10b981";

    const label =
      relationName ||
      (cardinality === "one-to-one"
        ? "1:1"
        : cardinality === "one-to-many"
        ? "1:N"
        : "M:N");

    const newEdge = {
      id: `edge-${Date.now()}`,
      source: pendingRelation.source,
      target: pendingRelation.target,
      type: "smoothstep",
      animated: true,
      style: { stroke: color, strokeWidth: 3 },
      label,
      labelStyle: { fill: "white", fontSize: 12, fontWeight: 600 },
      data: { relationType: type, cardinality },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    };

    const updated = [...edges, newEdge];
    setEdges(updated);
    pushHistory(nodes, updated);

    resetRelationState();
    showMsg(`${type} Created`, "success");
  };

  const resetRelationState = () => {
    setIsRelationMode(false);
    setSelectedTable(null);
    setPendingRelation(null);

    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, isHighlighted: false } }))
    );

    setShowRelationModal(false);
  };

  // Auto Layout
  const handleAutoLayout = () => {
    const newNodes = nodes.map((node, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      return {
        ...node,
        position: { x: 200 + col * 350, y: 100 + row * 350 },
      };
    });

    setNodes(newNodes);
    pushHistory(newNodes, edges);

    setTimeout(() => fitView({ padding: 0.3 }), 50);
    showMsg("Layout Organized", "success");
  };

  // Generate SQL
  const handleGenerateSQL = () => {
    const sql = generateSQL(nodes, edges);
    setSQLOutput(sql);
    setSQLModal(true);
  };

  // Export JSON
  const handleExport = () => {
    const data = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: { label: n.data.label, columns: n.data.columns },
      })),
      edges,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `db-schema-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showMsg("Exported", "success");
  };

  // Import JSON
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      const json = JSON.parse(await file.text());

      const importedNodes = json.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onUpdate: handleUpdateNode,
          onDelete: handleDeleteTable,
          onDuplicate: handleDuplicateTable,
          isHighlighted: false,
        },
      }));

      setNodes(importedNodes);
      setEdges(json.edges);
      pushHistory(importedNodes, json.edges);

      showMsg("Imported", "success");
    };

    input.click();
  };

  // Mouse move for relation line
  const handleMove = (e) => {
    if (isRelationMode && selectedTable)
      setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Hotkeys
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [historyIndex, history]);

  return (
    <div className="flex h-screen bg-slate-950" onMouseMove={handleMove}>
      {/* Sidebar */}
      <Sidebar
        onAddTable={handleAddTable}
        onRelationMode={handleRelationMode}
        isRelationMode={isRelationMode}
        onAutoLayout={handleAutoLayout}
        onGenerateSQL={handleGenerateSQL}
      />

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#c9c9c9" />
          <Controls />
          <MiniMap nodeColor="#1e293b" maskColor="rgba(0,0,0,0.7)" />
        </ReactFlow>

        {/* Connecting Line */}
        {isRelationMode && sourcePos && mousePos && (
          <ConnectingEdge sourceNode={sourcePos} mousePosition={mousePos} />
        )}

        {/* Top Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 px-4 py-2 rounded-lg flex gap-2 border border-slate-700 shadow-lg z-20">
          <button
            onClick={handleUndo}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-600 mx-1" />

          <button
            onClick={zoomIn}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={zoomOut}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => fitView({ padding: 0.2 })}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-600 mx-1" />

          <button
            onClick={handleExport}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 p-3 text-white rounded-lg shadow-lg z-20"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        nodes={nodes}
        edges={edges}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Relation Modal */}
      <RelationModal
        isOpen={showRelationModal}
        onClose={resetRelationState}
        onSelect={handleRelationSelect}
        sourceTable={pendingRelation?.sourceLabel}
        targetTable={pendingRelation?.targetLabel}
      />

      {/* SQL Modal */}
      <SQLModal
        isOpen={sqlModal}
        onClose={() => setSQLModal(false)}
        sql={sqlOutput}
      />

      {/* Notification */}
      <Notification message={notification.message} type={notification.type} />
    </div>
  );
}
