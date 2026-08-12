"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type HeroContent } from "../lib/heroTypes";
import PortraitPicker from "./PortraitPicker";

/*
 * Hero editor. Everything the hero renders is editable here, the portrait
 * included — it is picked from public/uploaded/ via PortraitPicker, which
 * writes into this same form object so one Save commits image and text
 * together. The section is scaffolded so future sections drop in as siblings.
 */

type Status = { kind: "idle" | "ok" | "err"; msg?: string };

/** Multi-line fields are stored as string[] but edited as one line per row. */
const toLines = (v: string[]) => v.join("\n");
const fromLines = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="nm-small mb-1.5 block uppercase tracking-wide text-ink/60">
        {label}
      </span>
      {children}
      {hint && <span className="nm-small mt-1 block text-ink/40">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-[var(--radius-inner)] border border-ink/15 bg-white/70 px-3 py-2.5 font-body text-[15px] text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent";

export default function HeroEditor({ initial }: { initial: HeroContent }) {
  const [form, setForm] = useState<HeroContent>(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const router = useRouter();

  const set = <K extends keyof HeroContent>(k: K, v: HeroContent[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    setStatus({ kind: "idle" });
  };

  /* Guard against losing edits to an accidental tab close / back nav. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      setForm(await res.json());
      setDirty(false);
      setStatus({ kind: "ok", msg: "Saved. The homepage is updated." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div>
        {/* Status */}
        {status.kind !== "idle" && (
          <div
            role="status"
            className={`mb-6 rounded-[var(--radius-inner)] px-4 py-3 text-[14px] ${
              status.kind === "ok"
                ? "bg-accent text-ink"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* ---------------- Portrait panel ----------------
              Was a locked read-only preview. The portrait is user-replaceable
              again, so this is now a full picker: upload, or choose anything
              sitting in public/uploaded/. It edits three fields of the same
              form object as the text panel, so one Save commits both. */}
          <PortraitPicker
            value={{
              portraitSrc: form.portraitSrc,
              portraitRatio: form.portraitRatio,
              portraitAlt: form.portraitAlt,
            }}
            onChange={(v) => {
              setForm((f) => ({ ...f, ...v }));
              setDirty(true);
              setStatus({ kind: "idle" });
            }}
          />

          {/* ---------------- Text panel ---------------- */}
          <section className="nm-card-solid rounded-[var(--radius-card)] p-5">
            <h2 className="nm-h3 mb-4 text-[18px]">Text &amp; stats</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Wordmark" hint="The giant yellow logo text.">
                <input className={inputCls} value={form.brandMark} onChange={(e) => set("brandMark", e.target.value)} />
              </Field>

              <Field label="Left caption">
                <input className={inputCls} value={form.leftText} onChange={(e) => set("leftText", e.target.value)} />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Headline (optional)"
                  hint={
                    form.headingLines.length
                      ? "One line per row — each becomes its own animated line. Clear the box to remove the headline entirely."
                      : "Empty — the hero renders with no headline. Type a line to bring it back."
                  }
                >
                  <textarea
                    className={`${inputCls} min-h-[92px] resize-y`}
                    value={toLines(form.headingLines)}
                    onChange={(e) => set("headingLines", fromLines(e.target.value))}
                    placeholder="Leave empty for no headline"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Right paragraph">
                  <textarea
                    className={`${inputCls} min-h-[92px] resize-y`}
                    value={form.rightText}
                    onChange={(e) => set("rightText", e.target.value)}
                  />
                </Field>
              </div>



              <Field label="Projects stat" hint='e.g. "80+"'>
                <input className={inputCls} value={form.projectsStat} onChange={(e) => set("projectsStat", e.target.value)} />
              </Field>

              <Field label="Projects label">
                <input className={inputCls} value={form.projectsLabel} onChange={(e) => set("projectsLabel", e.target.value)} />
              </Field>

              <Field label="Years of experience" hint="Counts up from 0 on the page.">
                <input
                  type="number"
                  min={0}
                  max={99}
                  className={inputCls}
                  value={form.yearsStat}
                  onChange={(e) => set("yearsStat", Number(e.target.value))}
                />
              </Field>

              <Field label="Experience label" hint="One line per row.">
                <textarea
                  className={`${inputCls} min-h-[68px] resize-y`}
                  value={toLines(form.yearsLabelLines)}
                  onChange={(e) => set("yearsLabelLines", fromLines(e.target.value))}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Skill chips" hint="One per row.">
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    value={toLines(form.skills)}
                    onChange={(e) => set("skills", fromLines(e.target.value))}
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky save bar — the form is long enough that a bottom-of-page
            button would be easy to miss. */}
        <div className="sticky bottom-6 mt-8 flex items-center justify-end gap-3">
          <div className="nm-card-solid flex items-center gap-3 rounded-full px-4 py-2.5">
            <span className="nm-small text-ink/50">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="nm-btn disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
