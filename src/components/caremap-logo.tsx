import { cn } from "@/lib/utils";

type CareMapLogoProps = {
  className?: string;
  title?: string;
};

/** CareMap logo: body silhouette with a symptom tap pin. */
export function CareMapLogo({ className, title = "CareMap" }: CareMapLogoProps) {
  return (
    // Plain <img>: OpenNext on Lambda does not reliably serve `/_next/image`.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/caremap-logo.png"
      alt={title}
      width={128}
      height={128}
      className={cn("size-7 shrink-0", className)}
      decoding="async"
    />
  );
}
