import { cn } from "@/lib/utils";

/** Static silhouette shown while the WebGL chunk loads, or if WebGL is unavailable. */
export function BodyMapPoster({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-3", className)}>
      <svg
        viewBox="0 0 120 240"
        className="h-[78%] max-h-[560px] w-auto animate-pulse text-foreground/10 motion-reduce:animate-none"
        aria-hidden="true"
      >
        <g fill="currentColor">
          <ellipse cx="60" cy="22" rx="14" ry="17" />
          <rect x="54" y="38" width="12" height="10" rx="5" />
          <path d="M34 50 Q60 42 86 50 L84 96 Q60 104 36 96 Z" />
          <path d="M37 98 Q60 106 83 98 L82 122 Q60 132 38 122 Z" />
          <rect x="22" y="52" width="11" height="44" rx="5.5" transform="rotate(8 27 74)" />
          <rect x="87" y="52" width="11" height="44" rx="5.5" transform="rotate(-8 92 74)" />
          <rect x="18" y="96" width="9" height="40" rx="4.5" transform="rotate(4 22 116)" />
          <rect x="93" y="96" width="9" height="40" rx="4.5" transform="rotate(-4 97 116)" />
          <rect x="41" y="124" width="16" height="58" rx="8" />
          <rect x="63" y="124" width="16" height="58" rx="8" />
          <rect x="43" y="178" width="12" height="54" rx="6" />
          <rect x="65" y="178" width="12" height="54" rx="6" />
        </g>
      </svg>
      {message ? <p className="max-w-56 text-center text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
