export interface BrandColors {
  primary: string;
  accent: string;
}

const HEX = /^#[0-9a-f]{6}$/i;
const FALLBACK: BrandColors = { primary: "#0f172a", accent: "#38bdf8" };

export function safeBrandColors(colors: BrandColors): BrandColors {
  return {
    primary: HEX.test(colors.primary) ? colors.primary : FALLBACK.primary,
    accent: HEX.test(colors.accent) ? colors.accent : FALLBACK.accent,
  };
}

export function brandCssVars(colors: BrandColors): React.CSSProperties {
  const safe = safeBrandColors(colors);
  return {
    "--brand": safe.primary,
    "--brand-accent": safe.accent,
  } as React.CSSProperties;
}

/**
 * Root-level rule so portalled UI (drawers, popovers) and the WebGL scene read
 * the same tenant colours. Values are validated hex, so this is injection-safe.
 */
export function brandRootCss(colors: BrandColors): string {
  const safe = safeBrandColors(colors);
  return `:root{--brand:${safe.primary};--brand-accent:${safe.accent};--primary:var(--brand);--primary-foreground:oklch(0.99 0 0);--ring:color-mix(in oklch,var(--brand) 60%,white);}`;
}
