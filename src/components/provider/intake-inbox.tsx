"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon, InboxIcon } from "lucide-react";
import Link from "next/link";
import { SeverityBadge } from "@/components/severity-badge";
import { useTenant } from "@/components/tenant-context";
import { TriageBadge } from "@/components/triage-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, shortRef } from "@/lib/format";
import { regionLabel } from "@/lib/regions";
import type { RouterOutputs } from "@/server/api/root";
import { useTRPC } from "@/trpc/client";

type InboxItem = RouterOutputs["intake"]["list"][number];

function regionSummary(ids: string[]) {
  const labels = ids.map(regionLabel);
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.slice(0, 2).join(", ")} +${labels.length - 2} more`;
}

function InboxRow({ item }: { item: InboxItem }) {
  const { slug } = useTenant();
  return (
    <li>
      <Link
        href={`/t/${slug}/provider/${item.id}`}
        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none md:px-5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <TriageBadge level={item.triageLevel} />
            <span className="truncate font-medium">{regionSummary(item.regionIds)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <SeverityBadge severity={item.maxSeverity} />
            <span>
              {item.regionCount} {item.regionCount === 1 ? "area" : "areas"}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.createdAt.toISOString()}>{timeAgo(item.createdAt)}</time>
            <span aria-hidden="true">·</span>
            <span className="font-mono">#{shortRef(item.id)}</span>
          </div>
        </div>
        <ChevronRightIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function InboxSection({ title, items }: { title: string; items: InboxItem[] }) {
  const headingId = `inbox-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="px-1 text-sm font-semibold">
        {title} <span className="font-normal text-muted-foreground">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing here.
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {items.map((item) => (
            <InboxRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function IntakeInbox() {
  const trpc = useTRPC();
  const { data, isPending, error } = useQuery(trpc.intake.list.queryOptions());

  if (isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading intakes">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Couldn&apos;t load intakes: {error.message}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
        <InboxIcon className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">No intakes yet</p>
        <p className="text-sm text-muted-foreground">Submit one from the patient view to see it here.</p>
      </div>
    );
  }

  const open = data.filter((i) => i.status === "submitted");
  const reviewed = data.filter((i) => i.status === "reviewed");

  return (
    <div className="flex flex-col gap-6">
      <InboxSection title="Needs review" items={open} />
      <InboxSection title="Reviewed" items={reviewed} />
    </div>
  );
}
