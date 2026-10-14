import type { Metadata } from "next";
import { ProgressWorkspace } from "@/components/views/ProgressWorkspace";

export const metadata: Metadata = {
  title: "My Progress",
};

export default function ProgressPage() {
  return <ProgressWorkspace />;
}
