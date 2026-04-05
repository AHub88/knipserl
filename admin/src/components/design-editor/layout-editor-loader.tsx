"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const LayoutEditor = dynamic(
  () => import("./layout-editor").then((m) => m.LayoutEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh] text-white/60">
        Editor wird geladen…
      </div>
    ),
  }
);

type LayoutEditorProps = ComponentProps<typeof LayoutEditor>;

export function LayoutEditorLoader(props: LayoutEditorProps) {
  return <LayoutEditor {...props} />;
}
