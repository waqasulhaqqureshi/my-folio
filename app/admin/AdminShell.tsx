"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroContent } from "../lib/heroTypes";
import type { Project } from "../lib/projectTypes";
import type { SiteSettings } from "../lib/settingsTypes";
import HeroEditor from "./HeroEditor";
import ProjectsEditor from "./ProjectsEditor";
import SettingsEditor from "./SettingsEditor";

/*
 * Admin shell — section tabs over the editors.
 *
 * Both editors stay MOUNTED and are hidden with `hidden` rather than being
 * conditionally rendered. Unmounting would throw away unsaved edits the moment
 * someone glanced at the other tab, which is a genuinely infuriating way to
 * lose work. The cost is both trees rendering at once, which is trivial here.
 */

type Tab = "hero" | "projects" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "projects", label: "Projects" },
  { id: "settings", label: "Layout" },
];

export default function AdminShell({
  hero,
  projects,
  settings,
}: {
  hero: HeroContent;
  projects: Project[];
  settings: SiteSettings;
}) {
  const [tab, setTab] = useState<Tab>("hero");
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-canvas px-5 py-10 text-ink md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="nm-eyebrow mb-2">Admin</p>
            <h1 className="nm-h2">Site content</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="nm-btn-ghost">
              View site
            </a>
            <button onClick={logout} className="nm-btn-ghost">
              Log out
            </button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Content sections"
          className="mb-8 flex gap-1 border-b border-ink/10"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`admin-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`admin-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 font-body text-[15px] transition ${
                tab === t.id
                  ? "border-ink text-ink"
                  : "border-transparent text-ink/50 hover:text-ink/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* `hidden` keeps the inactive panel in the tree (and out of the a11y
            tree) so its state survives a tab switch. */}
        <div
          id="admin-panel-hero"
          role="tabpanel"
          aria-labelledby="admin-tab-hero"
          hidden={tab !== "hero"}
        >
          <HeroEditor initial={hero} />
        </div>
        <div
          id="admin-panel-projects"
          role="tabpanel"
          aria-labelledby="admin-tab-projects"
          hidden={tab !== "projects"}
        >
          <ProjectsEditor initial={projects} />
        </div>
        <div
          id="admin-panel-settings"
          role="tabpanel"
          aria-labelledby="admin-tab-settings"
          hidden={tab !== "settings"}
        >
          <SettingsEditor initial={settings} />
        </div>
      </div>
    </main>
  );
}
