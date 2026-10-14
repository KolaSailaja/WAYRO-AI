"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { PageHeading, SectionCard } from "@/components/ui";
import { useAppState } from "@/components/app/AppStateProvider";

const STAGES = [
  { label: "Discover", icon: "⌕", href: "/opportunities", detail: "Explore opportunities that fit your interests." },
  { label: "Assess", icon: "◎", href: "/readiness", detail: "Understand strengths, gaps, and unknown requirements." },
  { label: "Learn", icon: "◇", href: "/learn", detail: "Turn skill gaps into achievable learning tasks." },
  { label: "Build", icon: "⬡", href: "/hackathon-lab", detail: "Shape a feasible, evidence-aware project proposal." },
  { label: "Apply", icon: "↗", href: "/opportunities", detail: "Track applications and their current status." },
  { label: "Achieve", icon: "✦", href: "/progress", detail: "Record progress from actions you actually complete." },
];

export default function JourneyPage() {
  const { state } = useAppState();
  const [rotation, setRotation] = useState({ x: -7, y: -12 });
  const pointer = useRef<{ x: number; y: number } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    pointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!pointer.current) return;
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    pointer.current = { x: event.clientX, y: event.clientY };
    setRotation((current) => ({
      x: Math.max(-25, Math.min(25, current.x - dy * 0.35)),
      y: current.y + dx * 0.35,
    }));
  }

  return (
    <div className="animate-fadein max-w-5xl mx-auto">
      <PageHeading title="Your WAYRO journey" subtitle="Discover → Assess → Learn → Build → Apply → Achieve" />
      <SectionCard className="mb-5">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Move the scene with a mouse or touch drag. Select any stage to open the matching workspace. The journey is a visual guide; progress is calculated from your saved profile and completed actions.
        </p>
      </SectionCard>
      <div
        className="journey-viewport mb-6"
        role="region"
        aria-label="Interactive 3D student journey. Drag to rotate; use the stage links below as a keyboard-accessible alternative."
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => { pointer.current = null; }}
        onPointerCancel={() => { pointer.current = null; }}
      >
        <div className="journey-scene" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
          <div className="journey-orbit journey-orbit-one" />
          <div className="journey-orbit journey-orbit-two" />
          {STAGES.map((stage, index) => {
            const angle = (Math.PI * 2 * index) / STAGES.length - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 36;
            const y = 50 + Math.sin(angle) * 34;
            return (
              <Link
                key={stage.label}
                href={stage.href}
                className="journey-node"
                style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) translateZ(${index % 2 ? 24 : 64}px)` }}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                aria-label={`${stage.label}: ${stage.detail}`}
              >
                <span className="journey-node-icon" aria-hidden="true">{stage.icon}</span>
                <span>{stage.label}</span>
              </Link>
            );
          })}
          <div className="journey-core" aria-hidden="true">WAYRO<br />AI</div>
        </div>
      </div>
      <p className="text-xs text-center mb-6" style={{ color: "var(--text-muted)" }}>Keyboard and reduced-motion friendly stage links are listed below the scene.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STAGES.map((stage) => (
          <Link key={stage.label} href={stage.href} className="card p-4 focus-visible:outline-indigo-600 hover:shadow-md transition-shadow">
            <span className="text-lg text-indigo-700" aria-hidden="true">{stage.icon}</span>
            <h2 className="font-semibold mt-1">{stage.label}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{stage.detail}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-center mt-5" style={{ color: "var(--text-muted)" }}>
        Current record: {state.applications.length} tracked applications · {state.learningTasks.filter((task) => task.status === "completed").length} learning tasks completed · {state.proposals.length} project proposals
      </p>
    </div>
  );
}
