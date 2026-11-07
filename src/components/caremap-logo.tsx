import { cn } from "@/lib/utils";

type CareMapLogoProps = {
  className?: string;
  title?: string;
};

/** CareMap mark: body silhouette with a symptom tap pin. */
export function CareMapLogo({ className, title = "CareMap" }: CareMapLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("size-7 shrink-0", className)}
    >
      <title>{title}</title>
      <rect width="64" height="64" rx="16" fill="#0F172A" />
      <path
        fill="#F7F5F2"
        d="M32 10c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8Zm-11.5 20.2c2.8-2.1 6.9-3.2 11.5-3.2s8.7 1.1 11.5 3.2c2.6 1.9 4 4.5 4 7.5V48c0 2.2-1.8 4-4 4H20.5c-2.2 0-4-1.8-4-4V37.7c0-3 1.4-5.6 4-7.5Z"
      />
      <circle cx="36.5" cy="34" r="5.5" fill="#38BDF8" />
      <circle cx="36.5" cy="34" r="2.25" fill="#F7F5F2" />
    </svg>
  );
}
