"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EMPTY_PROJECT,
  MEDIA_SPECS,
  specSummary,
  type DeviceSlot,
  type Project,
} from "../lib/projectTypes";

/*
 * Projects CRUD.
 *
 * The whole roster is edited locally and saved as one array (see the PUT route
 * for why). A master list on the left selects the row being edited on the
 * right, which keeps the page usable at nine projects and at ninety — an
 * accordion of nine full forms would not.
 */

type Status = { kind: "idle" | "ok" | "err"; msg?: string };

const inputCls =
  "w-full rounded-[var(--radius-inner)] border border-ink/15 bg-white/70 px-3 py-2.5 font-body text-[15px] text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent";

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

/** Crypto-free unique id: only needs to be unique within this roster. */
const newId = () =>
  `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export default function ProjectsEditor({ initial }: { initial: Project[] }) {
  const [list, setList] = useState<Project[]>(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const router = useRouter();

  const current = list.find((p) => p.id === selected) ?? null;

  /* Guard against losing edits to an accidental close. Same rationale as the
     hero editor — this form holds far more unsaved work. */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setStatus({ kind: "idle" });
  };

  /** Update one field of the selected project, by id rather than index — the
      list reorders, and an index would write to the wrong row after a move. */
  function patch<K extends keyof Project>(k: K, v: Project[K]) {
    if (!selected) return;
    setList((l) => l.map((p) => (p.id === selected ? { ...p, [k]: v } : p)));
    touch();
  }

  function add() {
    const p: Project = { ...EMPTY_PROJECT, id: newId() };
    setList((l) => [...l, p]);
    setSelected(p.id);
    touch();
  }

  function duplicate(id: string) {
    const src = list.find((p) => p.id === id);
    if (!src) return;
    const copy: Project = { ...src, id: newId(), name: `${src.name} copy` };
    setList((l) => {
      const i = l.findIndex((p) => p.id === id);
      return [...l.slice(0, i + 1), copy, ...l.slice(i + 1)];
    });
    setSelected(copy.id);
    touch();
  }

  function remove(id: string) {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`Delete "${p.name}"? This cannot be undone once you save.`)) return;
    setList((l) => {
      const i = l.findIndex((x) => x.id === id);
      const next = l.filter((x) => x.id !== id);
      // Select a neighbour so the detail pane never goes blank mid-edit.
      setSelected(next[Math.min(i, next.length - 1)]?.id ?? null);
      return next;
    });
    touch();
  }

  /** Reorder: the array order IS the carousel order on the public site. */
  function move(id: string, dir: -1 | 1) {
    setList((l) => {
      const i = l.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
    touch();
  }

  async function save() {
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setList(json);
      // The server drops unnamed rows, so the selection may no longer exist.
      if (!json.some((p: Project) => p.id === selected)) {
        setSelected(json[0]?.id ?? null);
      }
      setDirty(false);
      setStatus({ kind: "ok", msg: `Saved ${json.length} projects. The site is updated.` });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

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

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* ---------------- Master list ---------------- */}
        <section className="nm-card-solid h-fit rounded-[var(--radius-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="nm-h3 text-[18px]">
              Projects <span className="text-ink/40">({list.length})</span>
            </h2>
            <button onClick={add} className="nm-btn px-3 py-1.5 text-[13px]">
              + Add
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {list.map((p, i) => (
              <li key={p.id}>
                <div
                  className={`flex items-center gap-1 rounded-[var(--radius-inner)] border px-2 py-1.5 transition ${
                    p.id === selected
                      ? "border-ink/30 bg-white/80"
                      : "border-transparent hover:bg-white/50"
                  }`}
                >
                  <button
                    onClick={() => setSelected(p.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-current={p.id === selected}
                  >
                    <span className="block truncate font-body text-[14px] text-ink">
                      {p.name || <em className="text-ink/40">Untitled</em>}
                    </span>
                    <span className="nm-small block text-ink/40">
                      {p.available ? "Visible" : "Hidden"}
                      {p.mobileVideo ? " · phone video" : p.mobileImage ? " · phone still" : " · no phone media"}
                    </span>
                  </button>

                  <div className="flex flex-col">
                    <button
                      onClick={() => move(p.id, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${p.name} up`}
                      className="px-1 text-[10px] leading-none text-ink/50 disabled:opacity-20"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(p.id, 1)}
                      disabled={i === list.length - 1}
                      aria-label={`Move ${p.name} down`}
                      className="px-1 text-[10px] leading-none text-ink/50 disabled:opacity-20"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!list.length && (
              <li className="nm-small px-2 py-6 text-center text-ink/40">
                No projects. Add one to get started.
              </li>
            )}
          </ul>

          <button
            onClick={save}
            disabled={saving || !dirty}
            className="nm-btn mt-4 w-full justify-center disabled:opacity-50"
          >
            {saving ? "Saving…" : dirty ? "Save all changes" : "Saved"}
          </button>
        </section>

        {/* ---------------- Detail ---------------- */}
        {current ? (
          <section className="nm-card-solid rounded-[var(--radius-card)] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="nm-h3 text-[18px]">{current.name || "Untitled"}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => duplicate(current.id)}
                  className="nm-btn-ghost px-3 py-1.5 text-[13px]"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => remove(current.id)}
                  className="rounded-[var(--radius-inner)] border border-red-300 px-3 py-1.5 font-body text-[13px] text-red-700 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input
                  className={inputCls}
                  value={current.name}
                  onChange={(e) => patch("name", e.target.value)}
                />
              </Field>

              <Field label="Visit site URL" hint="Must start with http:// or https://">
                <input
                  className={inputCls}
                  value={current.demo}
                  onChange={(e) => patch("demo", e.target.value)}
                  placeholder="https://example.com"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={current.description}
                    onChange={(e) => patch("description", e.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Tech stack"
                  hint="Comma separated. These render as the chips beside the device."
                >
                  <input
                    className={inputCls}
                    value={current.technologies.join(", ")}
                    onChange={(e) =>
                      patch(
                        "technologies",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="CMS, GSAP, SEO"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={current.available}
                    onChange={(e) => patch("available", e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="font-body text-[15px]">
                    Visible on the site
                  </span>
                </label>
              </div>
            </div>

            <hr className="my-6 border-ink/10" />

            {/* Media, grouped by the device frame it feeds. */}
            <div className="grid gap-5 md:grid-cols-2">
              <MediaSlot
                slot="web"
                title="Web — tablet frame"
                videoSrc={current.video}
                imageSrc={current.image}
                onVideo={(src) => patch("video", src)}
                onImage={(src) => patch("image", src)}
                onError={(msg) => setStatus({ kind: "err", msg })}
                onOk={(msg) => setStatus({ kind: "ok", msg })}
              />
              <MediaSlot
                slot="mobile"
                title="Mobile — phone frame"
                videoSrc={current.mobileVideo}
                imageSrc={current.mobileImage}
                onVideo={(src) => patch("mobileVideo", src)}
                onImage={(src) => patch("mobileImage", src)}
                onError={(msg) => setStatus({ kind: "err", msg })}
                onOk={(msg) => setStatus({ kind: "ok", msg })}
              />
            </div>
          </section>
        ) : (
          <section className="nm-card-solid grid place-items-center rounded-[var(--radius-card)] p-12 text-center">
            <p className="nm-small text-ink/50">
              Select a project to edit, or add a new one.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * One device slot: its video, its poster, and the exact dimensions required.
 *
 * The requirement is stated BEFORE the file picker opens, not only in the
 * error after a rejected upload — the point is to stop someone exporting a
 * 20MB clip at the wrong ratio in the first place.
 * ------------------------------------------------------------------------- */
function MediaSlot({
  slot,
  title,
  videoSrc,
  imageSrc,
  onVideo,
  onImage,
  onError,
  onOk,
}: {
  slot: DeviceSlot;
  title: string;
  videoSrc: string;
  imageSrc: string;
  onVideo: (src: string) => void;
  onImage: (src: string) => void;
  onError: (msg: string) => void;
  onOk: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string>("");
  const ref = useRef<HTMLInputElement>(null);
  const spec = MEDIA_SPECS[slot];

  async function upload(file: File) {
    setBusy(true);
    setInfo("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", slot);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        /* The route returns the detected dimensions alongside a ratio
           rejection, so the message can say exactly what was wrong. */
        onError(json.error || "Upload failed.");
        if (json.dimensions) {
          setInfo(`Rejected: ${json.dimensions.width}x${json.dimensions.height}`);
        }
        return;
      }

      const d = json.dimensions;
      if (json.kind === "video") onVideo(json.src);
      else onImage(json.src);

      setInfo(`${d.width}x${d.height} · ratio ${json.ratio}`);
      onOk(
        `${json.kind === "video" ? "Video" : "Poster"} uploaded at ${d.width}x${d.height}. Remember to save.`
      );
    } catch {
      onError("Upload failed — is the server running?");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="rounded-[var(--radius-inner)] border border-ink/10 p-4">
      <h3 className="mb-1 font-body text-[15px] font-semibold text-ink">{title}</h3>

      {/* The spec, always visible. */}
      <p className="nm-small mb-3 text-ink/50">
        Required: {specSummary(slot)}
      </p>

      <div className="mb-3 grid gap-1.5">
        <PathRow label="Video" value={videoSrc} onClear={() => onVideo("")} />
        <PathRow label="Poster" value={imageSrc} onClear={() => onImage("")} />
      </div>

      {info && (
        <p className="nm-small mb-2 font-mono text-ink/60">{info}</p>
      )}

      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="nm-btn w-full justify-center text-[13px] disabled:opacity-50"
      >
        {busy ? "Verifying…" : "Upload video or poster"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <p className="nm-small mt-2 text-ink/40">
        Video up to 40MB (MP4/WebM), poster up to 8MB. Dimensions are checked
        against the {spec.recommended.width}x{spec.recommended.height} frame
        before the file is stored.
      </p>
    </div>
  );
}

function PathRow({
  label,
  value,
  onClear,
}: {
  label: string;
  value: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="nm-small w-14 shrink-0 uppercase tracking-wide text-ink/40">
        {label}
      </span>
      <code className="min-w-0 flex-1 truncate rounded bg-ink/5 px-2 py-1 font-mono text-[12px] text-ink/70">
        {value || "—"}
      </code>
      {value && (
        <button
          onClick={onClear}
          aria-label={`Clear ${label.toLowerCase()}`}
          className="shrink-0 px-1 text-[13px] text-ink/40 hover:text-red-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
