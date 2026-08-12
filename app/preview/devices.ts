/*
 * Device matrix for the responsive preview harness.
 *
 * The widths are chosen to land ON and AROUND this project's real breakpoints
 * rather than to enumerate handset marketing names: a preview that only shows
 * 390 and 1440 cannot reveal a bug that lives at 767 or 1200. Every boundary in
 * hero.css appears here together with a sample just inside and just outside it,
 * because breakpoint bugs are edge bugs.
 *
 * `h` matters as much as `w`: the hero composes against a 100vh stage and has a
 * dedicated `max-height: 620px` band, so a short-and-wide laptop is a genuinely
 * different case from a tall desktop of the same width.
 */
export type Device = {
  id: string;
  label: string;
  w: number;
  h: number;
  /** Which hero.css media block this viewport exercises. */
  band: "phone-sm" | "phone" | "tablet" | "short" | "desktop";
  /** Sits exactly on a breakpoint edge — the highest-risk widths. */
  edge?: boolean;
};

export const BANDS: Record<Device["band"], { label: string; rule: string }> = {
  "phone-sm": { label: "Small phone", rule: "max-width: 479px" },
  phone: { label: "Phone", rule: "max-width: 767px" },
  tablet: { label: "Tablet", rule: "768px – 1199px" },
  short: { label: "Short viewport", rule: "min-width: 768px and max-height: 620px" },
  desktop: { label: "Desktop", rule: "min-width: 1200px" },
};

export const DEVICES: Device[] = [
  { id: "320", label: "iPhone SE (smallest)", w: 320, h: 568, band: "phone-sm" },
  { id: "360", label: "Android compact", w: 360, h: 740, band: "phone-sm" },
  { id: "390", label: "iPhone 14", w: 390, h: 844, band: "phone-sm" },
  { id: "430", label: "iPhone Pro Max", w: 430, h: 932, band: "phone-sm" },
  { id: "479", label: "Breakpoint edge", w: 479, h: 900, band: "phone-sm", edge: true },
  { id: "480", label: "Just past 479", w: 480, h: 900, band: "phone", edge: true },
  { id: "600", label: "Small tablet portrait", w: 600, h: 960, band: "phone" },
  { id: "767", label: "Breakpoint edge", w: 767, h: 1024, band: "phone", edge: true },
  { id: "768", label: "iPad portrait", w: 768, h: 1024, band: "tablet", edge: true },
  { id: "834", label: "iPad Air", w: 834, h: 1112, band: "tablet" },
  { id: "900x600", label: "Short laptop", w: 900, h: 600, band: "short" },
  { id: "1024", label: "iPad landscape", w: 1024, h: 768, band: "tablet" },
  { id: "1180", label: "iPad Pro landscape", w: 1180, h: 820, band: "tablet" },
  { id: "1199", label: "Breakpoint edge", w: 1199, h: 800, band: "tablet", edge: true },
  { id: "1200", label: "Just past 1199", w: 1200, h: 800, band: "desktop", edge: true },
  { id: "1366", label: "Laptop 768p", w: 1366, h: 768, band: "desktop" },
  { id: "1440", label: "MacBook Pro 14", w: 1440, h: 900, band: "desktop" },
  { id: "1920", label: "Full HD", w: 1920, h: 1080, band: "desktop" },
  { id: "2560", label: "QHD", w: 2560, h: 1440, band: "desktop" },
];
