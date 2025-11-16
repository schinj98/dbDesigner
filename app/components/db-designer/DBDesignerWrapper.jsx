"use client";

import { ReactFlowProvider } from "reactflow";
import DBDesignerCanvas from "./DBDesignerCanvas";

export default function DBDesignerWrapper() {
  return (
    <ReactFlowProvider>
      <DBDesignerCanvas />
    </ReactFlowProvider>
  );
}
