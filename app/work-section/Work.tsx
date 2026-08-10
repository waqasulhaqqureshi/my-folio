import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import CountUp from "../animations/CountUp";
import { devProjects } from "./projectDetails";
import WorkCard from "./WorkCard";
import "./work.css";

/*
 * Work — structural replication of heynesh.com's Projects section.
 *
 * Source DOM:
 *   section.work_section
 *     └── .work-sticky            (dark gradient panel #000→#222)
 *         └── .work-container
 *             ├── .work-top-layout  (grid 1fr/1fr)
 *             │     ├── .column → .label.is-secondary + h2.h2-style-white
 *             │     └── p.work-top-text
 *             └── .work-track-wrap  → .work-track → .work-card ×N
 *
 * Deviations (documented): source's 400vh pin + 21vw sidebar offset are
 * dropped — the track scrolls natively with scroll-snap instead of a GSAP
 * horizontal scrub, so no dead scroll-space is created for adjacent sections.
 * The source's pin-spacer div (.work-sticky-support) is therefore omitted.
 */
const Work = () => {
  // Data-driven "living signal" stats (heynesh-style animated counters)
  const techCount = new Set(
    devProjects.flatMap((p) => p.technologies)
  ).size;

  return (
    <section className="work_section z-10" id="work" aria-label="Projects">
      <div className="work-sticky">
        <div className="work-container">
          <div className="work-top-layout nm-container">
            <div className="flex flex-col items-start">
              <span className="label is-secondary">Selected Work</span>
              <AnimatedTitle
                text={"Featured Work"}
                className="h2-style-white"
                wordSpace={"mr-[0.18em]"}
                charSpace={"mr-[0.001em]"}
              />

              {/* Living signal — counters inherit the hero's count-up */}
              <div className="work-stats" aria-label="Portfolio stats">
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
          </div>

          <div className="work-track-wrap" aria-label="Projects rail">
            <div className="work-track">
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
