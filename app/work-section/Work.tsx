"use client";
import { useState } from "react";
import AnimatedTitle from "../animations/AnimatedTitle";
import { devProjects } from "./projectDetails";
import { useProjectStepper } from "./useProjectStepper";
import DeviceFrame, { DeviceKind } from "./DeviceFrame";
import WorkSlide from "./WorkSlide";
import "./work.css";

/*
 * Work — projects shown one at a time inside a device frame, with a
 * Web / Mobile switch.
 *
 * The two views are genuinely different media, not the same asset re-cropped:
 *   web    → the 778x1100 .webm captures, in a tablet bezel
 *   mobile → 704x1520 portrait phone screens, in a phone bezel
 * Each frame declares its media's exact ratio, so nothing is ever cropped.
 */
const Work = () => {
  const [kind, setKind] = useState<DeviceKind>("web");
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
             * Tablist semantics: the two buttons control one shared panel, so
             * roving aria-selected + aria-controls is what tells a screen
             * reader these are alternative views of the same content rather
             * than two independent toggles.
             */}
            <div className="work-switch" role="tablist" aria-label="Choose a preview device">
              {(["web", "mobile"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  className="work-switch__btn"
                  aria-selected={kind === k}
                  aria-controls="work-stage-panel"
                  data-active={kind === k}
                  onClick={() => setKind(k)}
                >
                  {k === "web" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                      <rect x="2.5" y="4" width="19" height="13" rx="1.6" />
                      <path d="M8 20.5h8M12 17.5v3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
                      <path d="M10.8 18.8h2.4" strokeLinecap="round" />
                    </svg>
                  )}
                  {k === "web" ? "Web" : "Mobile"}
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

            {/* tabIndex=0 + onKeyDown: Left/Right step the carousel once the
                stage has focus. Bound here, not on window, so the rest of the
                page keeps its arrow keys. */}
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
                 * key includes BOTH the project and the device: changing either
                 * remounts WorkSlide, which fires useLazyVideo's cleanup and
                 * releases the decoder instead of accumulating one per step.
                 */}
                <WorkSlide key={`${project.id}-${kind}`} project={project} kind={kind} />
              </DeviceFrame>
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

          <div className="work-stage-caption" aria-live="polite" aria-atomic="true">
            <div className="work-stage-index">
              {String(index + 1).padStart(2, "0")} / {String(devProjects.length).padStart(2, "0")}
            </div>
            <h3 className="work-stage-title">{project.name}</h3>
            <p className="work-stage-desc">{project.description}</p>

            <div className="work-stage-labels">
              {project.technologies.map((tech) => (
                <span key={tech} className="work-label">
                  {tech}
                </span>
              ))}
            </div>

            <div>
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
          </div>

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
