"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BANDS, DEVICES, type Device } from "./devices";

/*
 * Responsive preview harness — the web equivalent of Flutter's device_preview.
 *
 * WHY IFRAMES AND NOT A CSS TRANSFORM
 * The tempting cheap version is to render the page in a scaled <div>. That is
 * worthless for this job: media queries resolve against the VIEWPORT, so a
 * 320px-wide div inside a 1440px window still matches the desktop rules and
 * every phone tile would be a lie. An iframe has its own viewport, so
 * `@media (max-width: 767px)` genuinely matches inside a 390px-wide frame.
 * `transform: scale()` is then applied only to shrink the already-correct
 * render so several fit on screen at once.
 *
 * WHY A ZOOM WRAPPER AROUND THE IFRAME
 * The iframe is laid out at its TRUE pixel size and scaled down visually. The
 * outer box reserves w*scale x h*scale so the grid does not overlap, while the
 * inner iframe keeps its real width — that separation is what keeps the media
 * queries honest under zoom.
 */

const SCALES = [0.2, 0.25, 0.33, 0.5, 0.75, 1] as const;

type Props = { path: string };

function Frame({
  device,
  scale,
  path,
  reloadKey,
}: {
  device: Device;
  scale: number;
  path: string;
  reloadKey: number;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  /* Report the iframe's own innerWidth back out. This is the harness auditing
     ITSELF: if a frame's real viewport ever disagrees with the width it claims
     to be, every conclusion drawn from it is invalid, so it is surfaced rather
     than assumed. Cross-origin would block this, but the frame is same-origin. */
  const [actual, setActual] = useState<number | null>(null);
  useEffect(() => {
    if (!loaded) return;
    try {
      const win = ref.current?.contentWindow;
      if (win) setActual(win.innerWidth);
    } catch {
      setActual(null);
    }
  }, [loaded, reloadKey]);

  const mismatch = actual !== null && Math.abs(actual - device.w) > 1;

  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="flex items-baseline gap-2 text-[12px] leading-tight">
        <span className="font-semibold text-ink">
          {device.w}×{device.h}
        </span>
        <span className="text-ink/45">{device.label}</span>
        {device.edge && (
          <span className="rounded bg-amber-200 px-1 text-[10px] font-semibold text-amber-900">
            EDGE
          </span>
        )}
        {mismatch && (
          <span className="rounded bg-red-200 px-1 text-[10px] font-semibold text-red-900">
            viewport {actual}px
          </span>
        )}
      </figcaption>

      <div
        className="relative shrink-0 overflow-hidden rounded-lg border border-ink/15 bg-white shadow-sm"
        style={{ width: device.w * scale, height: device.h * scale }}
      >
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-[11px] text-ink/40">
            loading…
          </div>
        )}
        <iframe
          ref={ref}
          key={reloadKey}
          src={path}
          title={`${device.w}x${device.h}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          style={{
            width: device.w,
            height: device.h,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </figure>
  );
}

export default function PreviewClient({ path: initialPath }: Props) {
  const [scale, setScale] = useState(0.25);
  const [path, setPath] = useState(initialPath);
  const [pathDraft, setPathDraft] = useState(initialPath);
  const [bands, setBands] = useState<Set<Device["band"]>>(
    () => new Set(Object.keys(BANDS) as Device["band"][])
  );
  const [reloadKey, setReloadKey] = useState(0);

  const shown = useMemo(
    () => DEVICES.filter((d) => bands.has(d.band)),
    [bands]
  );

  function toggleBand(b: Device["band"]) {
    setBands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#e9e6dd] text-ink">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-[#e9e6dd]/95 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <strong className="text-[15px]">Device preview</strong>

          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-ink/50">Path</span>
            <input
              value={pathDraft}
              onChange={(e) => setPathDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setPath(pathDraft);
              }}
              onBlur={() => setPath(pathDraft)}
              className="w-44 rounded border border-ink/20 bg-white px-2 py-1 font-mono text-[12px]"
            />
          </label>

          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-ink/50">Zoom</span>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="rounded border border-ink/20 bg-white px-2 py-1 text-[12px]"
            >
              {SCALES.map((s) => (
                <option key={s} value={s}>
                  {Math.round(s * 100)}%
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(BANDS) as Device["band"][]).map((b) => (
              <button
                key={b}
                onClick={() => toggleBand(b)}
                title={BANDS[b].rule}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  bands.has(b)
                    ? "border-ink/70 bg-ink text-[#e9e6dd]"
                    : "border-ink/20 bg-transparent text-ink/50"
                }`}
              >
                {BANDS[b].label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded border border-ink/20 bg-white px-3 py-1 text-[12px]"
          >
            Reload all
          </button>

          <span className="text-[12px] text-ink/40">
            {shown.length} viewport{shown.length === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <main className="flex flex-wrap items-start gap-6 p-5">
        {shown.map((d) => (
          <Frame
            key={d.id}
            device={d}
            scale={scale}
            path={path}
            reloadKey={reloadKey}
          />
        ))}
      </main>
    </div>
  );
}
