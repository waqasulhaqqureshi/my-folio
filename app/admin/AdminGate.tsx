"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/*
 * Password gate. Rendered by the server only when there is no valid session,
 * so the editor and its content are never shipped to an unauthenticated
 * visitor. On success the server sets an httpOnly cookie and we refresh, which
 * re-runs the server component and swaps in the editor.
 */
export default function AdminGate() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        setErr(error || "Incorrect password.");
        setPw("");
        inputRef.current?.focus();
        return;
      }
      /* refresh() re-runs the server component with the new cookie. A
         router.push to the same URL would be a no-op and leave the gate up. */
      router.refresh();
    } catch {
      setErr("Network error — is the server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-ink">
      <form
        onSubmit={submit}
        className="nm-card-solid w-full max-w-sm rounded-[var(--radius-card)] p-8"
        aria-labelledby="gate-title"
      >
        <p className="nm-eyebrow mb-2">Restricted</p>
        <h1 id="gate-title" className="nm-h3 mb-6">
          Admin access
        </h1>

        <label htmlFor="pw" className="nm-small mb-2 block uppercase tracking-wide text-ink/60">
          Password
        </label>
        <input
          id="pw"
          ref={inputRef}
          type="password"
          value={pw}
          autoFocus
          autoComplete="current-password"
          onChange={(e) => setPw(e.target.value)}
          aria-invalid={!!err}
          aria-describedby={err ? "pw-err" : undefined}
          className="mb-4 w-full rounded-[var(--radius-inner)] border border-ink/15 bg-white/70 px-4 py-3 font-body text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent"
        />

        {err && (
          <p id="pw-err" role="alert" className="nm-small mb-4 text-red-700">
            {err}
          </p>
        )}

        <button type="submit" disabled={busy || !pw} className="nm-btn w-full justify-center disabled:opacity-50">
          {busy ? "Checking…" : "Unlock"}
        </button>

        <a href="/" className="nm-small mt-6 block text-center text-ink/50 underline underline-offset-4">
          Back to site
        </a>
      </form>
    </main>
  );
}
