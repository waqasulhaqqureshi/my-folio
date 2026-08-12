"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_PORTRAIT } from "../lib/heroTypes";

/*
 * Hero portrait picker.
 *
 * The library is the CONTENTS OF A FOLDER, not a database table. Anything in
 * public/uploaded/ is offered, whether it arrived through this uploader or was
 * copied in over SFTP — which is the whole point of the folder, so the panel
 * re-lists from the server rather than tracking uploads in local state.
 *
 * Selecting does not save. It lifts the choice to HeroEditor, which persists it
 * with the rest of the hero on the existing Save button. Two reasons: the user
 * can compare options and back out with no write at all, and there is exactly
 * one save path for the whole tab instead of an image that commits instantly
 * while the text next to it stays dirty.
 */

export type PortraitEntry = {
  src: string;
  name: string;
  width: number;
  height: number;
  ratio: number;
  bytes: number;
  mtime: number;
};

export type PortraitValue = {
  portraitSrc: string;
  portraitRatio: number;
  portraitAlt: string;
};

/* The layout is composed around the bundled cutout's shape. Anything within a
   quarter of it drops in unnoticed; past that the head lands somewhere the
   wordmark and card cluster were not positioned for, so the panel says so
   rather than letting it be discovered on the live site. */
const REF_RATIO = HERO_PORTRAIT.ratio;
const RATIO_TOLERANCE = 0.25;

const kb = (b: number) =>
  b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

function ratioNote(r: number): string | null {
  const drift = Math.abs(r - REF_RATIO) / REF_RATIO;
  if (drift <= RATIO_TOLERANCE) return null;
  return r > REF_RATIO
    ? `Wider than the layout expects (${r.toFixed(2)} vs ${REF_RATIO.toFixed(2)}). The figure will sit shorter, and the cards may overlap the face.`
    : `Taller and narrower than the layout expects (${r.toFixed(2)} vs ${REF_RATIO.toFixed(2)}). The figure will read small on desktop.`;
}

export default function PortraitPicker({
  value,
  onChange,
}: {
  value: PortraitValue;
  onChange: (v: PortraitValue) => void;
}) {
  const [items, setItems] = useState<PortraitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const usingBundled = !value.portraitSrc;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portrait");
      if (!res.ok) throw new Error("Could not read the image folder.");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read the image folder.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /* Upload, then select. Uploading an image and then having to hunt for it in
     the grid would be a pointless extra step — the intent is unambiguous. */
  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      setErr(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/portrait", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed.");

        setItems((prev) => [data as PortraitEntry, ...prev]);
        onChange({
          portraitSrc: data.src,
          portraitRatio: data.ratio,
          portraitAlt: value.portraitAlt,
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [onChange, value.portraitAlt],
  );

  const selected = items.find((i) => i.src === value.portraitSrc);
  const note = selected ? ratioNote(selected.ratio) : null;

  /* A saved path whose file has since been deleted from the folder. Silently
     falling back would be worse than saying so: the hero is currently showing
     the bundled image and the panel would look like it disagreed. */
  const missing =
    !usingBundled && !loading && !selected
      ? value.portraitSrc
      : null;

  return (
    <section className="nm-card-solid h-fit rounded-[var(--radius-card)] p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="nm-h3 text-[18px]">Portrait</h2>
        <button
          type="button"
          onClick={() => void refresh()}
          className="nm-small text-ink/45 underline underline-offset-2 transition hover:text-ink/80"
        >
          Refresh
        </button>
      </div>

      {/* ---------------- Current selection preview ---------------- */}
      <div className="nm-plate mb-3 overflow-hidden rounded-[var(--radius-inner)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.portraitSrc || HERO_PORTRAIT.src}
          alt=""
          className="block max-h-56 w-full object-contain"
        />
      </div>
      <p className="nm-small mb-4 text-ink/45">
        {usingBundled
          ? "Using the bundled image that ships with the site."
          : `Using ${value.portraitSrc.replace("/uploaded/", "")}${
              selected ? ` · ${selected.width}x${selected.height}` : ""
            }`}
      </p>

      {missing && (
        <p className="nm-small mb-4 rounded-[var(--radius-inner)] bg-red-100 px-3 py-2.5 text-red-800">
          The selected file is no longer in the folder. The site is showing the
          bundled image until you pick another.
        </p>
      )}

      {note && (
        <p className="nm-small mb-4 rounded-[var(--radius-inner)] bg-amber-100 px-3 py-2.5 text-amber-900">
          {note}
        </p>
      )}

      {err && (
        <p className="nm-small mb-4 rounded-[var(--radius-inner)] bg-red-100 px-3 py-2.5 text-red-800">
          {err}
        </p>
      )}

      {/* ---------------- Upload ---------------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={`mb-4 rounded-[var(--radius-inner)] border border-dashed px-4 py-5 text-center transition ${
          drag ? "border-ink/50 bg-accent/25" : "border-ink/20 bg-white/40"
        }`}
      >
        <p className="nm-small mb-2 text-ink/55">
          {busy ? "Uploading…" : "Drop an image here, or"}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-[var(--radius-inner)] bg-ink px-3.5 py-2 font-body text-[14px] text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          Choose a file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <p className="nm-small mt-2 text-ink/40">
          PNG, JPEG, WebP or AVIF · up to 8 MB · transparent cut-out recommended
        </p>
      </div>

      {/* ---------------- Library ---------------- */}
      <p className="nm-small mb-2 uppercase tracking-wide text-ink/60">
        From <code className="font-mono text-[12px]">public/uploaded/</code>
      </p>

      <div className="grid grid-cols-3 gap-2">
        {/* The bundled asset is always offered, as the way back. Without it a
            custom pick would be irreversible from the UI. */}
        <button
          type="button"
          onClick={() =>
            onChange({ portraitSrc: "", portraitRatio: 0, portraitAlt: "" })
          }
          className={`overflow-hidden rounded-[var(--radius-inner)] border-2 p-1 text-left transition ${
            usingBundled ? "border-ink" : "border-transparent hover:border-ink/25"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PORTRAIT.src}
            alt=""
            className="nm-plate block h-20 w-full rounded-[calc(var(--radius-inner)-2px)] object-contain"
          />
          <span className="nm-small mt-1 block truncate text-ink/55">Bundled</span>
        </button>

        {items.map((it) => {
          const active = it.src === value.portraitSrc;
          return (
            <button
              key={it.src}
              type="button"
              onClick={() =>
                onChange({
                  portraitSrc: it.src,
                  portraitRatio: it.ratio,
                  portraitAlt: value.portraitAlt,
                })
              }
              title={`${it.name} · ${it.width}x${it.height} · ${kb(it.bytes)}`}
              className={`overflow-hidden rounded-[var(--radius-inner)] border-2 p-1 text-left transition ${
                active ? "border-ink" : "border-transparent hover:border-ink/25"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt=""
                loading="lazy"
                className="nm-plate block h-20 w-full rounded-[calc(var(--radius-inner)-2px)] object-contain"
              />
              <span className="nm-small mt-1 block truncate text-ink/55">
                {it.name}
              </span>
            </button>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <p className="nm-small mt-3 text-ink/40">
          The folder is empty. Upload above, or copy images into{" "}
          <code className="font-mono text-[12px]">public/uploaded/</code> and hit
          Refresh.
        </p>
      )}

      {/* Alt text belongs with the image, not in the text panel. */}
      <label className="mt-4 block">
        <span className="nm-small mb-1.5 block uppercase tracking-wide text-ink/60">
          Alt text
        </span>
        <input
          className="w-full rounded-[var(--radius-inner)] border border-ink/15 bg-white/70 px-3 py-2.5 font-body text-[15px] text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent"
          value={value.portraitAlt}
          placeholder={HERO_PORTRAIT.alt}
          onChange={(e) => onChange({ ...value, portraitAlt: e.target.value })}
        />
        <span className="nm-small mt-1 block text-ink/40">
          Describes the image to screen readers. Blank uses “{HERO_PORTRAIT.alt}”.
        </span>
      </label>
    </section>
  );
}
