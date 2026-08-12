"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HERO_PORTRAIT, type HeroContent } from "../lib/heroTypes";

/*
 * Hero editor. Everything the hero renders is editable here EXCEPT the
 * portrait, which is locked to the bundled asset and shown read-only.
 * The section is scaffolded so future sections drop in as sibling panels.
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
          {/* ---------------- Image panel (read-only) ----------------
              The portrait is locked to the bundled asset, so this panel is a
              preview and nothing more: no file input, no replace button, no alt
              field. The controls are REMOVED rather than disabled — a disabled
              button invites clicking and implies the capability still exists
              somewhere, whereas the endpoint behind it now returns 410. */}
          <section className="nm-card-solid h-fit rounded-[var(--radius-card)] p-5">
            <h2 className="nm-h3 mb-4 text-[18px]">Portrait</h2>

            {/* Two crops now ship — a bottom-cropped desktop asset and the
                full-length mobile one — so the panel previews both rather than
                implying a single image is in play. */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {[
                { ...HERO_PORTRAIT.desktop, label: "Desktop" },
                { ...HERO_PORTRAIT.mobile, label: "Mobile" },
              ].map((v) => (
                <figure key={v.label} className="m-0">
                  <div className="nm-plate overflow-hidden rounded-[var(--radius-inner)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.src}
                      alt={`${HERO_PORTRAIT.alt} — ${v.label.toLowerCase()} crop`}
                      className="block max-h-56 w-full object-contain"
                    />
                  </div>
                  <figcaption className="nm-small mt-1.5 text-ink/45">
                    {v.label} · {v.ratio.toFixed(3)}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-[var(--radius-inner)] bg-ink/5 px-3 py-2.5">
              <svg
                viewBox="0 0 16 16"
                className="mt-[2px] h-3.5 w-3.5 shrink-0 fill-current text-ink/50"
                aria-hidden="true"
              >
                <path d="M4.5 7V5a3.5 3.5 0 1 1 7 0v2H12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h.5Zm1.5 0h4V5a2 2 0 1 0-4 0v2Z" />
              </svg>
              <p className="nm-small text-ink/50">
                This image is fixed as part of the site design and can&rsquo;t be
                changed here.
              </p>
            </div>
          </section>

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
