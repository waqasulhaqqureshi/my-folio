import SongCarousel from "./SongCarousel";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import CountUp from "../animations/CountUp";
import { songs } from "./songDetails";

/*
 * About — nm design system continuation of the hero.
 * Layout: display statement up top; md+ two-column reading measure
 * (narrative left / tools right), song marquee across the bottom.
 */
const toolGroups = [
  {
    title: "Frontend Tools",
    items:
      "JavaScript (ES6+), React, Next.js, TypeScript, Prismic CMS, Redux, Redux Toolkit, React Testing Library, Vitetest, HTML5, Git/GitHub, NextAuth, Formik.",
  },
  {
    title: "UI Libraries",
    items:
      "CSS3/SCSS/SASS, Tailwind CSS, Material UI, Framer Motion, GSAP, Bootstrap, Chart.js.",
  },
  {
    title: "Design Tools",
    items:
      "Figma, Framer, FigJam, Adobe XD, ProtoPie, Adobe Photoshop, UX Research, UI Design, Prototyping.",
  },
];

const About = () => {
  return (
    <section className="nm-section z-10" id="about" aria-label="About me">
      <div className="nm-container">
        <span className="nm-eyebrow mb-6 md:mb-8">About Me</span>

        <AnimatedTitle
          text={"I MAKE BRANDS BEAUTIFUL, WEBSITES POWERFUL AND CONTENT CAPTIVATING."}
          className={
            "nm-display mb-10 max-w-full text-left text-ink md:mb-16"
          }
          wordSpace={"mr-[0.18em]"}
          charSpace={"mr-[0.001em]"}
        />

        <div className="flex w-full flex-col gap-10 md:gap-12 lg:flex-row lg:justify-between lg:gap-20">
          {/* Narrative column */}
          <div className="flex w-full flex-col gap-5 md:gap-6 lg:max-w-[58%]">
            <AnimatedBody
              className="nm-body text-ink/80"
              text={"I specialize in crafting high-converting landing pages and websites for SaaS, Web3 & AI startups. I'm passionate about building software that makes a difference."}
            />
            <AnimatedBody
              className="nm-body text-ink/80"
              text={
                "Beyond my work as a frontend developer, I'm an active leader in tech communities on campus. As a member of the Google Developer Student Clubs and Microsoft Learn Student Ambassadors, I've led workshops and mentored other students."
              }
            />
            <AnimatedBody
              className="nm-body text-ink/80"
              text={
                "When I'm not coding, you can find me binge-watching anime, hanging out with friends, cheering on Manchester United, or discovering new music in my favorite genres like RnB, UK Drill, and Chill Rap."
              }
            />
            <AnimatedBody
              className="nm-body text-ink/80"
              text={
                "I'm currently working on some exciting projects that I can't wait to share with you. But I’m always open to new opportunities and collaborations."
              }
            />

            {/* Living-signal counters (hero count-up pattern, ink variant) */}
            <div
              className="mt-4 flex flex-wrap gap-8 md:gap-10"
              aria-label="About stats"
            >
              <div className="nm-stat nm-stat--ink">
                <CountUp
                  className="nm-stat__num"
                  target={toolGroups.length}
                  pad={2}
                />
                <span className="nm-stat__label">Tool stacks</span>
              </div>
              <div className="nm-stat nm-stat--ink">
                <CountUp
                  className="nm-stat__num"
                  target={songs.length}
                  pad={2}
                />
                <span className="nm-stat__label">Tracks on repeat</span>
              </div>
              <div className="nm-stat nm-stat--ink">
                <CountUp className="nm-stat__num" target={2} />
                <span className="nm-stat__label">Tech communities</span>
              </div>
            </div>
          </div>

          {/* Tooling rail */}
          <div className="flex w-full flex-col gap-6 md:gap-7 lg:max-w-[34%]">
            {toolGroups.map((group) => (
              <div key={group.title} className="nm-card nm-pad">
                <AnimatedTitle
                  text={group.title}
                  className={
                    "mb-3 font-display text-[17px] font-medium uppercase leading-none tracking-wide text-ink md:text-[19px]"
                  }
                  wordSpace={"mr-[0.25em]"}
                  charSpace={"mr-[0.01em]"}
                />
                <AnimatedBody
                  className="nm-small leading-relaxed text-ink/65"
                  text={group.items}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Song rail */}
      <div className="mt-14 md:mt-20">
        <div className="nm-container mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="nm-h3">On repeat</h3>
          <AnimatedBody
            text="A few songs I can recommend if you're looking for some fresh tunes :)"
            className="nm-small uppercase tracking-wide text-ink/55"
          />
        </div>
        <SongCarousel />
      </div>
    </section>
  );
};

export default About;
