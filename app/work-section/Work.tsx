"use client";
import { useState } from "react";
import AnimatedTitle from "../animations/AnimatedTitle";
import { devProjects } from "./projectDetails";
import { useProjectStepper } from "./useProjectStepper";
import DeviceFrame, { DeviceKind } from "./DeviceFrame";
import WorkSlide from "./WorkSlide";
import "./work.css";

/*
 * Work — projects one at a time in a device frame, with a Mobile / Web switch.
 *
 * LAYOUT
 * On desktop the stage is a three-column grid: title + CTA on the left, the
 * device in the middle, description + stack on the right. Everything about a
 * project is therefore visible in one viewport — previously the caption sat
 * below the device and required a scroll to read. Below 1024px it collapses
 * to a single centred column in DOM order.
 *
 * Mobile is the default tab: the app previews are the more distinctive work,
 * so they lead.
 */
const Work = () => {
  const [kind, setKind] = useState<DeviceKind>("mobile");
  const { index, prev, next, canPrev, canNext, go, onKeyDown } =
    useProjectStepper(devProjects.length);
  const project = devProjects[index];

  if (!project) return null;

  return (
    <section className="work_section" id="work" aria-label="Projects">
      <div className="work-sticky">
        <div className="work-container">
          <header className="work-head">
            <div className="label is-secondary">Projects</div>
            <AnimatedTitle
              text={"Things I've Built"}
              className="h2-style-white"
              wordSpace={"mr-[0.18em]"}
              charSpace={"mr-[0.001em]"}
            />

            {/*
             * Tablist: both buttons share aria-controls pointing at the single
             * stage panel, so it announces as two views of one thing rather
             * than two unrelated toggles.
             *
             * data-idle marks the tab that is NOT active — it carries the
             * travelling yellow glow that invites a click on the other view.
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
                  data-idle={kind !== k}
                  onClick={() => setKind(k)}
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

            {/*
             * key={index} on the two text columns restarts their entry
             * animation on every step, so the copy visibly refreshes rather
             * than silently swapping under the reader.
             */}
            <div className="work-info work-info--left" key={`l-${index}`}>
              <div className="work-stage-index">
                {String(index + 1).padStart(2, "0")}
                <span className="work-stage-total"> / {String(devProjects.length).padStart(2, "0")}</span>
              </div>
              <h3 className="work-stage-title">{project.name}</h3>
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
            </div>

            <div
              id="work-stage-panel"
              className="work-stage-viewport"
              tabIndex={0}
              role="group"
              aria-roledescription="carousel"
              aria-label={`Project ${index + 1} of ${devProjects.length}: ${project.name}, ${kind} view`}
              onKeyDown={onKeyDown}
            >
              <DeviceFrame kind={kind}>
                {/*
                 * key includes the device kind: switching tabs remounts the
                 * slide, firing useLazyVideo's teardown so the decoder is
                 * released rather than left buffering behind a hidden panel.
                 */}
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
            {`Project ${index + 1} of ${devProjects.length}: ${project.name}. ${project.description}`}
          </p>

          <div className="work-dots" role="tablist" aria-label="Choose a project">
            {devProjects.map((p, i) => (
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
