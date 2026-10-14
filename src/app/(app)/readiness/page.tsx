import type { Metadata } from "next";
import { ReadinessWorkspace } from "@/components/views/ReadinessWorkspace";

export const metadata: Metadata = { title: "Readiness" };

export default function ReadinessPage() {
  return <ReadinessWorkspace />;
}
