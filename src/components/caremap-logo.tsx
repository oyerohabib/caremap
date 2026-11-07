import Image from "next/image";
import { cn } from "@/lib/utils";

type CareMapLogoProps = {
  className?: string;
  title?: string;
};

/** CareMap logo: body silhouette with a symptom tap pin. */
export function CareMapLogo({ className, title = "CareMap" }: CareMapLogoProps) {
  return (
    <Image
      src="/caremap-logo.png"
      alt={title}
      width={128}
      height={128}
      className={cn("size-7 shrink-0 rounded-lg", className)}
      priority
    />
  );
}
