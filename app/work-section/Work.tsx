"use client";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import { devProjects } from "./projectDetails";
import { useProjectStepper } from "./useProjectStepper";
import DeviceFrame from "./DeviceFrame";
import WorkSlide from "./WorkSlide";
import "./work.css";

/*
 * Work — heynesh.com's projects section, presented one project at a time
 * inside a tablet frame.
 *
 * WHY A TABLET AND NOT A PHONE
 * Every clip in public/videos is 778x1100 (ratio 0.707) — a tablet-portrait
 * capture. A phone bezel is ~0.46, so the same footage would have to be
 * cropped by roughly a third of its width or pillarboxed inside the notch.
 * The frame matches the media instead of the media being mangled to fit the
 * frame.
 *
 * WHY ONE AT A TIME
 * A device frame is large; three abreast would shrink each to a thumbnail and
 * defeat the point of framing them at all. Arrows step through the roster and
 * disable at the ends, so the length of the list stays legible — the same
 * reason the original scroll-scrub was replaced.
 */
const Work = () => {
  const { index, prev, next, canPrev, canNext, go, onKeyDown } =
    useProjectStepper(devProjects.length);
  const project = devProjects[index];

  if (!project) return null;

  return (
    <section className="work_section" id="work" aria-label="Selected work">
      <div className="work-sticky">
        <div className="work-container">
          <div className="work-top-layout">
            <div className="column">
              <div className="label is-secondary">Selected Work</div>
              <AnimatedTitle
                text={"Built in Webflow, Made to Perform"}
                className="h2-style-white max-width-700"
                wordSpace={"mr-[0.18em]"}
                charSpace={"mr-[0.001em]"}
              />
            </div>

            <div className="work-top-right">
              <AnimatedBody
                text="Over seven years I've helped businesses across different industries turn their ideas into websites that look and work exactly how they imagined. Here's a look at some of that work."
                className="work-top-text"
              />
            </div>
          </div>

          {/* Arrows flank the device so the direction of travel is
              unmistakable and neither control ever covers the screen. */}
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
             * tabIndex=0 + onKeyDown: focusing the stage lets Left/Right step
             * the carousel. Bound here rather than on window so arrow keys are
             * not stolen from the rest of the page.
             */}
            <div
              className="work-stage-viewport"
              tabIndex={0}
              role="group"
              aria-roledescription="carousel"
              aria-label={`Project ${index + 1} of ${devProjects.length}: ${project.name}`}
              onKeyDown={onKeyDown}
            >
              <DeviceFrame>
                {/*
                 * key={project.id} deliberately remounts WorkSlide on every
                 * step. That is what triggers useLazyVideo's cleanup, which
                 * runs the full pause/removeAttribute/load() reset and frees
                 * the previous decoder instead of leaking one per project.
                 */}
                <WorkSlide key={project.id} project={project} />
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

          {/*
           * aria-live=polite announces the project change to screen readers.
           * The visible caption IS the live region — a separate visually-hidden
           * announcement would duplicate what sighted users already see.
           */}
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
