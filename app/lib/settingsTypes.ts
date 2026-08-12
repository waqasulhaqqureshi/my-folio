/*
 * Site settings — small layout knobs that are not section content.
 *
 * Client-safe (no `fs`), so the admin editor, the nav dock and the API route
 * all share this contract.
 */

export type SiteSettings = {
  /**
   * Horizontal offset of the collapsed nav capsule, as a percentage of the
   * dock's own width. Positive moves right, negative left.
   *
   * A share of the dock rather than the viewport so it tracks the dock at
   * every breakpoint. Exposed in the admin panel because the "right distance"
   * depends on the projects device frame, which is itself editable — a fixed
   * value would be wrong the moment someone uploads a wider preview.
   */
  dockCapsuleOffset: number;
  /** Hard cap in rem, so the offset cannot push the capsule off a narrow screen. */
  dockCapsuleMaxRem: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  dockCapsuleOffset: 62,
  dockCapsuleMaxRem: 16,
};

export const SETTINGS_LIMITS = {
  dockCapsuleOffset: { min: -120, max: 220, step: 2 },
  dockCapsuleMaxRem: { min: 2, max: 40, step: 0.5 },
} as const;

/** Clamp one numeric field into its allowed range, falling back if unusable. */
function num(v: unknown, fb: number, min: number, max: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fb;
  return Math.min(Math.max(v, min), max);
}

/**
 * Coerce unknown JSON into SiteSettings, field by field.
 *
 * Never spread parsed JSON over the defaults — a hand-edited file could inject
 * a NaN or a string into a CSS custom property and break the dock's layout.
 */
export function coerceSettings(raw: unknown): SiteSettings {
  const o = (raw ?? {}) as Record<string, unknown>;
  const L = SETTINGS_LIMITS;
  return {
    dockCapsuleOffset: num(
      o.dockCapsuleOffset,
      DEFAULT_SETTINGS.dockCapsuleOffset,
      L.dockCapsuleOffset.min,
      L.dockCapsuleOffset.max
    ),
    dockCapsuleMaxRem: num(
      o.dockCapsuleMaxRem,
      DEFAULT_SETTINGS.dockCapsuleMaxRem,
      L.dockCapsuleMaxRem.min,
      L.dockCapsuleMaxRem.max
    ),
  };
}
