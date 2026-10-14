import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntakeDetail } from "@/components/provider/intake-detail";
import { intakeIdSchema } from "@/lib/schemas";

export const metadata: Metadata = { title: "Intake detail" };

export default async function IntakeDetailPage({
  params,
}: PageProps<"/t/[tenant]/provider/[intakeId]">) {
  const { intakeId } = await params;
  const parsed = intakeIdSchema.safeParse({ id: intakeId });
  if (!parsed.success) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <IntakeDetail id={parsed.data.id} />
    </main>
  );
}
