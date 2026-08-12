"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SETTINGS,
  SETTINGS_LIMITS,
  type SiteSettings,
} from "../lib/settingsTypes";

/*
 * Layout settings.
 *
 * Currently one control group: where the collapsed nav capsule sits. It is
 * exposed rather than hard-coded because the "safe" offset depends on the
 * projects device frame, which is itself editable — upload a wider preview and
 * a fixed value is suddenly wrong.
 *
 * The preview below is a true-to-scale diagram rather than a screenshot: it
 * uses the same percentage-of-dock-width maths as the real CSS, so dragging
 * the slider shows exactly where the pill will land relative to the device.
 */

type Status = { kind: "idle" | "ok" | "err"; msg?: string };

export default function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const router = useRouter();

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    setStatus({ kind: "idle" });
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setForm(json);
      setDirty(false);
      setStatus({ kind: "ok", msg: "Saved. The dock is updated." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  const L = SETTINGS_LIMITS;

  return (
    <div>
      {status.kind !== "idle" && (
        <div
          role="status"
          className={`mb-6 rounded-[var(--radius-inner)] px-4 py-3 text-[14px] ${
            status.kind === "ok" ? "bg-accent text-ink" : "bg-red-100 text-red-800"
          }`}
        >
          {status.msg}
        </div>
      )}

      <section className="nm-card-solid rounded-[var(--radius-card)] p-5">
        <h2 className="nm-h3 mb-1 text-[18px]">Collapsed menu capsule</h2>
        <p className="nm-small mb-5 max-w-prose text-ink/50">
          While the projects section is on screen the nav dock folds into a
          small capsule. Move it clear of the device frame so it never covers
          the preview or its controls.
        </p>

        <CapsulePreview offset={form.dockCapsuleOffset} maxRem={form.dockCapsuleMaxRem} />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Slider
            label="Horizontal offset"
            hint="Percentage of the dock's width. Negative moves left of centre."
            value={form.dockCapsuleOffset}
            min={L.dockCapsuleOffset.min}
            max={L.dockCapsuleOffset.max}
            step={L.dockCapsuleOffset.step}
            unit="%"
            onChange={(v) => set("dockCapsuleOffset", v)}
          />
          <Slider
            label="Maximum shift"
            hint="Hard cap so the capsule cannot run off a narrow screen. Halved below 640px."
            value={form.dockCapsuleMaxRem}
            min={L.dockCapsuleMaxRem.min}
            max={L.dockCapsuleMaxRem.max}
            step={L.dockCapsuleMaxRem.step}
            unit="rem"
            onChange={(v) => set("dockCapsuleMaxRem", v)}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="nm-btn disabled:opacity-40"
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
          <button
            onClick={() => {
              setForm(DEFAULT_SETTINGS);
              setDirty(true);
            }}
            className="nm-btn-ghost"
          >
            Reset to default
          </button>
          <span className="nm-small text-ink/40">
            Effective shift: min({form.dockCapsuleOffset}%, {form.dockCapsuleMaxRem}rem)
          </span>
        </div>
      </section>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="nm-small mb-1.5 flex items-center justify-between uppercase tracking-wide text-ink/60">
        {label}
        <output className="font-mono text-[13px] normal-case tracking-normal text-ink">
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <span className="nm-small mt-1 block text-ink/40">{hint}</span>
    </label>
  );
}

/*
 * Scale diagram of the collapsed state.
 *
 * The dock is drawn at a nominal width and the capsule positioned with the
 * SAME expression the stylesheet uses — left:50% plus min(offset%, maxRem) —
 * so what is shown here is what ships. The device frame is drawn centred,
 * because that is where the projects section puts it, making overlap
 * immediately visible.
 */
function CapsulePreview({ offset, maxRem }: { offset: number; maxRem: number }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-inner)] border border-ink/10 bg-[#1b1b1b] p-4">
      <div className="relative mx-auto h-40 w-full max-w-md">
        {/* The device frame, centred — what the capsule must not cover. */}
        <div
          className="absolute left-1/2 top-2 h-28 w-20 -translate-x-1/2 rounded-md border-2 border-white/25 bg-white/5"
          aria-hidden="true"
        >
          <span className="nm-small absolute inset-x-0 bottom-1 text-center text-[10px] text-white/40">
            device
          </span>
        </div>

        {/* The dock's footprint. */}
        <div
          className="absolute bottom-2 left-1/2 h-8 w-[min(22rem,88%)] -translate-x-1/2 rounded-full border border-dashed border-white/20"
          aria-hidden="true"
        />

        {/* The capsule, placed by the shipping expression. */}
        <div
          className="absolute bottom-2 flex h-8 items-center rounded-full bg-[#dfdece] px-3 text-[10px] font-bold uppercase tracking-wider text-black/70 shadow-lg transition-[margin] duration-200"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            marginLeft: `min(${offset}%, ${maxRem}rem)`,
          }}
        >
          ••• Menu
        </div>
      </div>
      <p className="nm-small mt-2 text-center text-white/35">
        Preview — the capsule must clear the device frame
      </p>
    </div>
  );
}
