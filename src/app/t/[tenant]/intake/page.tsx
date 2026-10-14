import type { Metadata } from "next";
import { IntakeFlow } from "@/components/intake/intake-flow";

export const metadata: Metadata = { title: "Symptom intake" };

export default function IntakePage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">Symptom intake</h1>
      <IntakeFlow />
    </main>
  );
}
