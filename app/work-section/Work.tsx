"use client";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import { devProjects } from "./projectDetails";
import { useTrackCarousel } from "./useTrackCarousel";
import WorkCard from "./WorkCard";
import "./work.css";

/*
 * Work — heynesh.com's projects section, driven by explicit arrow controls.
 *
 * The source pins the section for 400vh and scrubs the track horizontally off
 * vertical scroll. That is replaced here with prev/next arrows: the user can
 * see how much is left, skip ahead, and operate it from the keyboard — none of
 * which a scroll-scrub allows. The card DOM and styling stay 1:1 with source.
 *
 * The rail remains a native scroll container, so trackpad swipe and touch drag
 * still work; the arrows are an addition, not a replacement.
 */
const Work = () => {
  const { railRef, canPrev, canNext, prev, next } = useTrackCarousel();

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

          {/* Arrows flank the rail so the direction of travel is unmistakable
              and neither control ever covers a card. */}
          <div className="work-rail">
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
             * tabIndex=0 + aria-label: a scrollable region must be reachable and
             * operable by keyboard (arrow keys scroll it natively once focused).
             */}
            <div
              className="work-track-wrap"
              ref={railRef}
              tabIndex={0}
              role="group"
              aria-label="Projects, horizontally scrollable"
            >
              <div className="work-track">
                {devProjects.map((project, i) => (
                  <WorkCard key={project.id} {...project} position={i} />
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
        </div>
      </div>
    </section>
  );
};

export default Work;
