import type { Metadata } from "next";
import { LearningWorkspace } from "@/components/views/LearningWorkspace";

export const metadata: Metadata = {
  title: "Learning Roadmap",
};

export default function LearnPage() {
  return <LearningWorkspace />;
}
