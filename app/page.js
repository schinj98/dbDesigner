"use client";

import dynamic from "next/dynamic";

// Load wrapper, not canvas
const DBDesignerWrapper = dynamic(
  () => import("@/app/components/db-designer/DBDesignerWrapper"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <DBDesignerWrapper />
    </main>
  );
}
