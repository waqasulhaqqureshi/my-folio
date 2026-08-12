"use client";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../lib/projectTypes";
import { useProjectStepper } from "./useProjectStepper";
import DeviceFrame, { DeviceKind } from "./DeviceFrame";
import WorkSlide from "./WorkSlide";
import "./work.css";

/*
 * Work — projects one at a time in a device frame, with a Mobile / Web switch.
 *
 * Content comes from the admin store (data/projects.json) via the server
 * component, so the roster, its order and all its media are editable at
 * /admin without a deploy.
 *
 * On desktop the stage is a five-column grid: title + CTA left, device centre,
 * description + stack right — everything about a project readable in one
 * viewport, no scrolling. Below 1024px it collapses to a stacked column.
 */

/* The idle-tab attractor runs twice and then stops for good. An indefinite
   loop reads as a broken element after the first few seconds; two passes is
   enough to be noticed and short enough not to nag. */
const ATTRACTOR_CYCLES = 2;
const CYCLE_MS = 2400;

const Work = ({ projects }: { projects: Project[] }) => {
  const [kind, setKind] = useState<DeviceKind>("mobile");
  const { index, prev, next, canPrev, canNext, go, onKeyDown } =
    useProjectStepper(projects.length);
  const project = projects[index];

  /*
   * Attractor lifecycle.
   *
   * `hint` gates the animation. It restarts on every switch (the newly-idle
   * tab is a different button and deserves its own two passes) and is cancelled
   * the moment the user actually interacts with the switch — at that point they
   * have found the control and the animation is pure noise.
   */
  const [hint, setHint] = useState(true);
  const engaged = useRef(false);

  useEffect(() => {
    if (engaged.current) return;
    setHint(true);
    const t = setTimeout(() => setHint(false), ATTRACTOR_CYCLES * CYCLE_MS);
    return () => clearTimeout(t);
  }, [kind]);

  function choose(k: DeviceKind) {
    // Any click on the switch permanently retires the attractor.
    engaged.current = true;
    setHint(false);
    setKind(k);
  }

  if (!project) return null;

  return (
    <section className="work_section" id="work" aria-label="Projects">
      <div className="work-sticky">
        <div className="work-container">
          <header className="work-head">
            <h2 className="work-title">Projects</h2>

            {/*
             * Tablist: both buttons share aria-controls pointing at the single
             * stage panel, so it announces as two views of one thing rather
             * than two unrelated toggles.
             *
             * data-hint marks the inactive tab while the attractor is live.
             * It goes false after two cycles, which also removes the animation
             * from the compositor rather than leaving it paused.
             */}
            <div className="work-switch" role="tablist" aria-label="Choose a preview device">
              {(["mobile", "web"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  className="work-switch__btn"
                  aria-selected={kind === k}
                  aria-controls="work-stage-panel"
                  data-active={kind === k}
                  data-hint={kind !== k && hint}
                  onClick={() => choose(k)}
                >
                  <span className="work-switch__inner">
                    {k === "mobile" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
                        <path d="M10.8 18.8h2.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <rect x="2.5" y="4" width="19" height="13" rx="1.6" />
                        <path d="M8 20.5h8M12 17.5v3" strokeLinecap="round" />
                      </svg>
                    )}
                    {k === "mobile" ? "Mobile" : "Web"}
                  </span>
                </button>
              ))}
            </div>
          </header>

          <div className="work-stage">
            <button
              type="button"
              className="work-nav-btn"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous project"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* key={index} on the text columns restarts their entry animation
                on every step, so the copy visibly refreshes rather than
                silently swapping under the reader. */}
            <div className="work-info work-info--left" key={`l-${index}`}>
              <div className="work-stage-index">
                {String(index + 1).padStart(2, "0")}
                <span className="work-stage-total">
                  {" "}
                  / {String(projects.length).padStart(2, "0")}
                </span>
              </div>
              <h3 className="work-stage-title">{project.name}</h3>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-stage-link"
                  aria-label={`${project.name} — open project in a new tab`}
                >
                  Visit site
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H8M17 7v9" />
                  </svg>
                </a>
              )}
            </div>

            <div
              id="work-stage-panel"
              className="work-stage-viewport"
              tabIndex={0}
              role="group"
              aria-roledescription="carousel"
              aria-label={`Project ${index + 1} of ${projects.length}: ${project.name}, ${kind} view`}
              onKeyDown={onKeyDown}
            >
              <DeviceFrame kind={kind}>
                {/* key includes the device kind: switching tabs remounts the
                    slide, firing useLazyVideo's teardown so the decoder is
                    released rather than left buffering behind a hidden panel. */}
                <WorkSlide key={`${project.id}-${kind}`} project={project} kind={kind} />
              </DeviceFrame>
            </div>

            <div className="work-info work-info--right" key={`r-${index}`}>
              <p className="work-stage-desc">{project.description}</p>
              <div className="work-stage-labels">
                {project.technologies.map((tech) => (
                  <span key={tech} className="work-label">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="work-nav-btn"
              onClick={next}
              disabled={!canNext}
              aria-label="Next project"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Off-screen mirror of the caption: the visible copy is split across
              two columns and reordered by CSS, which would make a live region
              announce in the wrong order. */}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {`Project ${index + 1} of ${projects.length}: ${project.name}. ${project.description}`}
          </p>

          <div className="work-dots" role="tablist" aria-label="Choose a project">
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                className="work-dot"
                aria-current={i === index}
                aria-selected={i === index}
                aria-label={`Show ${p.name}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
