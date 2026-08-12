"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroContent } from "../lib/heroTypes";

/*
 * Hero editor. Everything the hero renders is editable here; the section is
 * scaffolded so future sections drop in as sibling panels.
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
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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

  async function upload(file: File) {
    setUploading(true);
    setStatus({ kind: "idle" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      // The server already persisted profileImg; mirror it locally so the
      // preview updates without a round trip.
      setForm((f) => ({ ...f, profileImg: json.src }));
      setStatus({ kind: "ok", msg: "Image replaced." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /*
   * Download the current hero image.
   *
   * A plain <a download> only works same-origin — for the remote CDN default
   * the attribute is ignored and the browser navigates to the image instead.
   * Fetching to a blob makes download work for both cases.
   */
  async function download() {
    try {
      const res = await fetch(form.profileImg, { mode: "cors" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = form.profileImg.split("/").pop()?.split("?")[0] || "hero-image";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // CORS can block the blob path on a third-party CDN; opening the image
      // in a new tab always works and the user can save it manually.
      window.open(form.profileImg, "_blank", "noopener,noreferrer");
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
          {/* ---------------- Image panel ---------------- */}
          <section className="nm-card-solid h-fit rounded-[var(--radius-card)] p-5">
            <h2 className="nm-h3 mb-4 text-[18px]">Portrait</h2>

            <div className="nm-plate mb-4 overflow-hidden rounded-[var(--radius-inner)]">
              {/* Deliberately a plain <img>, not next/image: the src is
                  user-supplied and may point at a host that is not in
                  remotePatterns, which would throw at render. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.profileImg}
                alt={form.profileImgAlt}
                className="block max-h-64 w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="nm-btn w-full justify-center disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Replace image"}
              </button>
              <button onClick={download} className="nm-btn-ghost w-full justify-center">
                Download current
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              <p className="nm-small mt-1 text-ink/40">
                JPG, PNG, WebP, AVIF or GIF · max 8MB. Replacing saves immediately.
              </p>
            </div>

            <div className="mt-5">
              <Field label="Image alt text" hint="Describes the photo to screen readers.">
                <input
                  className={inputCls}
                  value={form.profileImgAlt}
                  onChange={(e) => set("profileImgAlt", e.target.value)}
                />
              </Field>
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
