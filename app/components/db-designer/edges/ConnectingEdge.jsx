export default function ConnectingEdge({ sourceNode, mousePosition }) {
    if (!sourceNode || !mousePosition) return null;
  
    return (
      <svg className="absolute inset-0 pointer-events-none z-40">
        <defs>
          <marker
            id="connecting-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
          </marker>
        </defs>
  
        <line
          x1={sourceNode.x}
          y1={sourceNode.y}
          x2={mousePosition.x}
          y2={mousePosition.y}
          stroke="#fbbf24"
          strokeWidth="3"
          strokeDasharray="5,5"
          markerEnd="url(#connecting-arrow)"
        />
      </svg>
    );
  }
  