// component/DBDesignerCanvas.jsx (Complete Updated File)

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
  getConnectedEdges,
} from "reactflow";

import "reactflow/dist/style.css";

// Components
import TableNode from "./nodes/TableNode";
import Sidebar from "./sidebar/Sidebar";
import SettingsPanel from "./settings/SettingsPanel";
import InspectorPanel from "./inspector/InspectorPanel"; // NEW IMPORT
import RelationModal from "./modals/RelationModal";
import SQLModal from "./modals/SQLModal";
import Notification from "./modals/Notification";
import ConnectingEdge from "./edges/ConnectingEdge";
import NoteNode from "./nodes/NoteNode"; // NEW IMPORT

// Utils
import generateSQL from "./utils/generateSQL";
import { saveHistory, undo, redo } from "./utils/history";
import { TEMPLATES } from "../db-designer/utils/TableTemplates"; // Corrected import path

// Icons
import { Save, Undo, Redo, ZoomIn, ZoomOut, Maximize2, Settings } from "lucide-react";

const nodeTypes = { tableNode: TableNode, noteNode: NoteNode };

// --- Drag and Drop Logic ---
let id = 0;
const getId = () => `dndnode_${id++}`;
// ---------------------------

export default function DBDesignerCanvas() {
  // Basic states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRelationMode, setIsRelationMode] = useState(false);
  
  // Feature 11: Inspector state
  const [selectedNode, setSelectedNode] = useState(null); 

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
  const { zoomIn, zoomOut, fitView, project } = useReactFlow();

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
  const handleDeleteNode = (id) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find(n => n.id === id);
      if (!nodeToDelete) return nds;

      // Only delete connecting edges if it's a table (tables have handles)
      const isTable = nodeToDelete.type === 'tableNode';

      let e = edges;
      if (isTable) {
        const connectedEdges = edges.filter(
          (edge) => edge.source === id || edge.target === id
        );
        e = edges.filter((edge) => !connectedEdges.includes(edge));
        setEdges(e);
      }
      
      const n = nds.filter((x) => x.id !== id);

      pushHistory(n, e);
      setSelectedNode(null); // Deselect if deleted
      showMsg(`${nodeToDelete.data.label || 'Item'} Deleted`, "warning");
      return n;
    });
  };
  const handleAddNote = () => {
    const noteId = getId();
    const newNote = {
      id: `note-${noteId}`,
      type: "noteNode",
      position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      data: {
        nodeId: `note-${noteId}`,
        label: `Note ${nodes.length + 1}`, // Internal label
        content: "Double click to start documentation...",
        color: '#fde047',
        onUpdate: handleUpdateNode,
        onDelete: handleDeleteNode,
      },
      // Ensure notes don't interfere with connections
      isConnectable: false, 
      draggable: true,
      selectable: true,
    };
    
    const updated = [...nodes, newNote];
    setNodes(updated);
    pushHistory(updated, edges);
    showMsg("Sticky Note Added", "success");
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

  // Add Table (Handles both empty and template)
  const handleAddTable = (template = null) => {
    const tableId = getId();
    const tableLabel = template ? template.label : `Table_${nodes.length + 1}`;
    const tableColumns = template ? template.columns : [{ id: Date.now(), name: "id", type: "INT", isPrimary: true }];
    const tableColor = template ? template.color : undefined;

    const newTable = {
      id: `table-${tableId}`,
      type: "tableNode",
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        nodeId: `table-${tableId}`,
        label: tableLabel,
        columns: tableColumns,
        color: tableColor, // Passed color
        onUpdate: handleUpdateNode,
        onDelete: handleDeleteTable,
        onDuplicate: handleDuplicateTable,
        isHighlighted: false,
      },
    };

    const updated = [...nodes, newTable];
    setNodes(updated);
    pushHistory(updated, edges);
    showMsg(`${tableLabel} Table Added`, "success");
  };

  // Update Table Node
  const handleUpdateNode = (nodeId, data) => {
    const updated = nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    );
    setNodes(updated);
    pushHistory(updated, edges);
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(updated.find(n => n.id === nodeId));
    }
  };

  // Delete Table
  const handleDeleteTable = (id) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find(n => n.id === id);
      if (!nodeToDelete) return nds;

      const connectedEdges = edges.filter(
        (e) => e.source === id || e.target === id
      );

      const n = nds.filter((x) => x.id !== id);
      const e = edges.filter((x) => !connectedEdges.includes(x));

      setEdges(e);
      pushHistory(n, e);
      setSelectedNode(null); // Deselect if deleted
      showMsg("Table Deleted", "warning");
      return n;
    });
  };

  // Duplicate Table
  const handleDuplicateTable = (id) => {
    const src = nodes.find((n) => n.id === id);
    if (!src) return;
  
    // deep clone columns array
    const clonedColumns = src.data.columns.map(col => ({ ...col, id: Date.now() + Math.random() }));
  
    const newNodeId = `table-${getId()}`;

    const dup = {
      ...src,
      id: newNodeId,
      position: { x: src.position.x + 60, y: src.position.y + 60 },
      data: {
        ...src.data,
        nodeId: newNodeId,
        label: src.data.label + "_copy",
        columns: clonedColumns,
        isHighlighted: false
      }
    };
  
    const newNodes = [...nodes, dup];
  
    setNodes(newNodes);
    pushHistory(newNodes, edges);
    showMsg("Duplicated", "success");
  };
  
  // Relation Mode On/Off
  const handleRelationMode = () => {
    setIsRelationMode((prev) => !prev);
    setSelectedNode(null); // Close inspector when entering relation mode

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

  // Node Click Handler (Used for Relation Mode)
  const onNodeClick = (evt, node) => {
    if (isRelationMode) {
        if (!selectedTable) {
            setSelectedTable(node.id);
            const nodeEl = evt.currentTarget;
            const rect = nodeEl.getBoundingClientRect();
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
    }
  };
  
  // Node Context Menu Handler (Used for Inspector Selection - Feature 11)
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault(); // Prevent browser context menu
    
    // Toggle/Select for Inspector
    const isSelected = node.id === selectedNode?.id;

    // Deselect all other nodes visually
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === node.id && !isSelected })));
    
    // Set Inspector State
    setSelectedNode(isSelected ? null : node);
    
  }, [setNodes, selectedNode]);

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
    setSourcePos(null);

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
        data: { label: n.data.label, columns: n.data.columns, color: n.data.color, notes: n.data.notes }, // Included notes
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

  // Mouse move (only for relation line now)
  const handleMove = (e) => {
    if (isRelationMode && selectedTable) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // --- DND Handlers ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const templateId = event.dataTransfer.getData("templateId");

      if (type === "templateNode" && templateId) {
        const template = TEMPLATES.find((t) => t.id === templateId);
        if (template) {
          const position = project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          const newNode = {
            id: `table-${getId()}`,
            type: "tableNode",
            position,
            data: {
              nodeId: `table-${getId()}`,
              label: template.label,
              columns: template.columns,
              color: template.color,
              onUpdate: handleUpdateNode,
              onDelete: handleDeleteTable,
              onDuplicate: handleDuplicateTable,
              isHighlighted: false,
            },
          };

          const newNodes = [...nodes, newNode];
          setNodes(newNodes);
          pushHistory(newNodes, edges);
          showMsg(`${template.label} Template Added`, "success");
        }
      }
    },
    [nodes, edges, project]
  );

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
        onAddTable={() => handleAddTable()}
        onRelationMode={handleRelationMode}
        isRelationMode={isRelationMode}
        onAddNote={handleAddNote}
        onAutoLayout={handleAutoLayout}
        onGenerateSQL={handleGenerateSQL}
      />

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          attributionPosition={null}
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu} // Feature 11: Inspector trigger
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#c9c9c9" />
          <Controls />
          <MiniMap nodeColor="#1e293b" maskColor="rgba(0,0,0,0.7)" />
        </ReactFlow>

        {/* Connecting Line */}
        {isRelationMode && sourcePos && mousePos && (
          <ConnectingEdge sourceNode={project(sourcePos)} mousePosition={mousePos} />
        )}

        {/* Top Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 px-4 py-2 rounded-lg flex gap-2 border border-slate-700 shadow-lg z-20">
          <button onClick={handleUndo} className="p-2 text-white hover:bg-slate-700 rounded">
            <Undo className="w-4 h-4" />
          </button>

          <button onClick={handleRedo} className="p-2 text-white hover:bg-slate-700 rounded">
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-600 mx-1" />

          <button onClick={zoomIn} className="p-2 text-white hover:bg-slate-700 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>

          <button onClick={zoomOut} className="p-2 text-white hover:bg-slate-700 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => fitView({ padding: 0.2 })}
            className="p-2 text-white hover:bg-slate-700 rounded"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-600 mx-1" />

          <button onClick={handleExport} className="p-2 text-white hover:bg-slate-700 rounded">
            <Save className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Button (Will open Inspector if a node is selected) */}
        <button
          onClick={() => selectedNode ? setSelectedNode(null) : setSettingsOpen(!settingsOpen)}
          className={`absolute top-4 right-4 p-3 text-white rounded-lg shadow-lg z-20 transition-colors ${
            selectedNode ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-700'
          }`}
          title={selectedNode ? "Close Inspector" : "Open Settings"}
        >
          {selectedNode ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Feature 11: Inspector Panel */}
      <InspectorPanel
        selectedNode={selectedNode}
        onUpdateNode={handleUpdateNode}
        onClose={() => setSelectedNode(null)}
        nodes={nodes}
        edges={edges}
      />

      {/* Settings Panel (Visible only if no node is selected AND isOpen is true) */}
      {!selectedNode && (
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          nodes={nodes}
          edges={edges}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}

      {/* Relation Modal */}
      <RelationModal
        isOpen={showRelationModal}
        onClose={resetRelationState}
        onSelect={handleRelationSelect}
        sourceTable={pendingRelation?.sourceLabel}
        targetTable={pendingRelation?.targetLabel}
      />

      {/* SQL Modal */}
      <SQLModal isOpen={sqlModal} onClose={() => setSQLModal(false)} sql={sqlOutput} />

      {/* Notification */}
      <Notification message={notification.message} type={notification.type} />
    </div>
  );
}