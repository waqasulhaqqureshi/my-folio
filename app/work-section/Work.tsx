"use client";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import CountUp from "../animations/CountUp";
import { devProjects } from "./projectDetails";
import { mediaForIndex } from "./workMedia";
import { useRevealGrid } from "../hooks/useRevealGrid";
import WorkCard from "./WorkCard";
import "./work.css";

/*
 * Work — Phase 1 structural overhaul.
 *
 * DEPRECATED: the previous `.work-track-wrap` horizontal scroll-snap rail.
 * It hid 60% of the portfolio behind a gesture desktop users rarely discover,
 * couldn't be tabbed through predictably, and forced every card to a fixed
 * `clamp()` height that had nothing to do with its content.
 *
 * REPLACEMENT: a responsive CSS Grid (1 / 2 / 3 columns) where each card is a
 * SUBGRID participant. The track defines four named rows — media, title, copy,
 * meta — and each card inherits them via `grid-template-rows: subgrid`, so all
 * titles sit on one baseline and all stack-chips on another, no matter how
 * uneven the copy is. That cross-card alignment is heynesh.com's core layout
 * heuristic, and it is the one thing the old flex rail structurally could not
 * express.
 *
 * Entry animation is delegated to ONE container-level IntersectionObserver
 * (see useRevealGrid) instead of N per-card framer-motion drivers.
 */
const Work = () => {
  const techCount = new Set(devProjects.flatMap((p) => p.technologies)).size;
  const gridRef = useRevealGrid<HTMLDivElement>({ stagger: 70 });

  return (
    <section className="work_section z-10" id="work" aria-label="Featured work">
      <div className="work-sticky">
        <div className="work-container nm-container">
          <header className="work-top-layout">
            <div className="flex flex-col items-start">
              <span className="label is-secondary">Selected Work</span>
              <AnimatedTitle
                text={"Featured Work"}
                className="h2-style-white"
                wordSpace={"mr-[0.18em]"}
                charSpace={"mr-[0.001em]"}
              />

              <div className="work-stats">
                <div className="nm-stat">
                  <CountUp
                    className="nm-stat__num"
                    target={devProjects.length}
                    pad={2}
                    suffix="+"
                  />
                  <span className="nm-stat__label">Projects shipped</span>
                </div>
                <div className="nm-stat">
                  <CountUp
                    className="nm-stat__num"
                    target={techCount}
                    pad={2}
                    suffix="+"
                  />
                  <span className="nm-stat__label">Technologies</span>
                </div>
                <div className="nm-stat">
                  <CountUp className="nm-stat__num" target={100} suffix="%" />
                  <span className="nm-stat__label">Launch rate</span>
                </div>
              </div>
            </div>

            <AnimatedBody
              text="A selection of client and personal projects — designed, engineered and shipped end-to-end. Every build is measured by how it performs, not just how it looks."
              className="work-top-text"
            />
          </header>

          {/*
           * `id` is referenced by the h2 for the section's accessible name.
           * The grid is a plain div: the cards are <article> landmarks, so no
           * list semantics are asserted that a screen reader would announce
           * redundantly on top of each card's own label.
           */}
          <div className="work-grid" ref={gridRef}>
            {devProjects.map((project, i) => (
              <WorkCard
                key={project.id}
                id={project.id}
                position={i}
                name={project.name}
                description={project.description}
                technologies={project.technologies}
                github={project.github}
                demo={project.demo}
                image={project.image}
                available={project.available}
                media={mediaForIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
