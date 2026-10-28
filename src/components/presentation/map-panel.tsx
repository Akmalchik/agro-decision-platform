"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { PresentationMap } from "@/gis/components/presentation-map";
const Map = dynamic(() => import("@/gis/components/presentation-map").then((module) => module.PresentationMap), {
  ssr: false, loading: () => <div className="presentation-map animate-pulse bg-slate-100" aria-busy="true" />,
});
export function PresentationMapPanel(props: ComponentProps<typeof PresentationMap>) { return <Map {...props} />; }
