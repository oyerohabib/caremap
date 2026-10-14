import type { Metadata } from "next";
import { IntakeInbox } from "@/components/provider/intake-inbox";

export const metadata: Metadata = { title: "Provider inbox" };

export default function ProviderPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-[max(env(safe-area-inset-bottom),2rem)] md:px-6 md:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Intake inbox</h1>
        <p className="text-sm text-muted-foreground">
          Open intakes are sorted by triage level, then by time. Demo data only.
        </p>
      </div>
      <IntakeInbox />
    </main>
  );
}
