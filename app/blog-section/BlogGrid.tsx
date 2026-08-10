import BlogCarousel from "./BlogCarousel";
import AnimatedBody from "../animations/AnimatedBody";

/*
 * Blog — nm design system. Same heading contract as Work/Certificates
 * (eyebrow + display h2 + right copy) so the vertical rhythm never breaks.
 */
const Blog = () => {
  return (
    <section id="blog" className="nm-section z-10" aria-label="Blog">
      <div className="nm-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col items-start gap-4 md:gap-5">
            <span className="nm-eyebrow">Writing</span>
            <h2 className="nm-h2">From the blog</h2>
          </div>
          <AnimatedBody
            text="Articles to reinforce knowledge and help others building something similar."
            className="nm-body max-w-full md:max-w-[32ch] md:text-right"
          />
        </div>

        <div className="mt-10 md:mt-14">
          <BlogCarousel />
        </div>
      </div>
    </section>
  );
};

export default Blog;
