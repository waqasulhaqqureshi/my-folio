"use client";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import { devProjects } from "./projectDetails";
import { useHorizontalPin } from "./useHorizontalPin";
import WorkCard from "./WorkCard";
import "./work.css";

/*
 * Work — 1:1 structural port of heynesh.com's projects section
 * ("Built in Webflow, Made to Perform").
 *
 * SOURCE DOM (from the live Webflow build):
 *   section.work_section            min-height:400vh
 *     └── div.work-sticky           position:sticky; bottom:0; min-height:100vh
 *         └── div.work-container
 *             ├── div.work-top-layout        grid 1fr 1fr
 *             │     ├── div.column → .label.is-secondary + h2.h2-style-white
 *             │     └── p.work-top-text
 *             └── div.work-track-wrap        padding-left:55%
 *                   └── div.work-track       flex row, gap 2.08vw
 *                         └── a.work-card ×N
 *
 * The 400vh + sticky + horizontally-scrubbed track IS the section's identity —
 * the previous grid rebuild discarded it. Restored here, with the GSAP scrub
 * reimplemented natively (see useHorizontalPin: GSAP is not a dependency).
 *
 * Content is the source's own roster (1910.ai, SemiconBio, Happy Ring, PSSLTD,
 * Lilipad, Omicron, Puck, Alosant, RAY AI) with its exact label stacks.
 */
const Work = () => {
  const { sectionRef, trackRef, pinHeight, enabled } = useHorizontalPin(
    devProjects.length
  );

  return (
    <section
      className="work_section"
      id="work"
      aria-label="Selected work"
      ref={sectionRef}
      /* Scroll runway for the pin; 0 (auto) on mobile / reduced-motion. */
      style={pinHeight ? { minHeight: `${pinHeight}px` } : undefined}
      data-pinned={enabled ? "true" : "false"}
    >
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
            <AnimatedBody
              text="Over seven years I've helped businesses across different industries turn their ideas into websites that look and work exactly how they imagined. Here's a look at some of that work."
              className="work-top-text"
            />
          </div>

          <div className="work-track-wrap">
            <div className="work-track" ref={trackRef}>
              {devProjects.map((project, i) => (
                <WorkCard key={project.id} {...project} position={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
