import ReviewCard from "./ReviewCard";
import { reviewDetails } from "./reviewDetails";
import AnimatedBody from "../animations/AnimatedBody";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

/*
 * Testimonials — nm design system.
 * Responsive intent: 1 column on mobile (stacked cards) → 2 columns at sm
 * → 3 columns at lg so card captions never cramp on narrow viewports.
 */
const Reviews = () => {
  return (
    <section
      id="reviews"
      className="nm-section z-10"
      aria-label="Testimonials"
    >
      <div className="nm-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col items-start gap-4 md:gap-5">
            <span className="nm-eyebrow">Selected Clients</span>
            <h2 className="nm-h2">Testimonials</h2>
          </div>
          <AnimatedBody
            text="Real stories from clients and collaborators who have experienced the work firsthand."
            className="nm-body max-w-full md:max-w-[32ch] md:text-right"
          />
        </div>

        <motion.div
          className="mt-10 grid w-full grid-cols-1 place-items-stretch gap-5 sm:grid-cols-2 md:mt-14 md:gap-6 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {reviewDetails.map((review, index) => (
            <ReviewCard
              key={review.name}
              name={review.name}
              role={review.role}
              company={review.company}
              profileImg={review.profileImg}
              testimonial={review.testimonial}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, delay: 0.1, ease: [0.44, 0, 0.22, 0.99] },
          }}
          viewport={{ amount: "some", once: true }}
          className="mt-12 flex justify-center md:mt-16"
        >
          <a
            href="https://contra.com/victorwilliams"
            target="_blank"
            rel="noopener noreferrer"
            className="nm-btn"
          >
            Hire me on Contra
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="text-[12px]"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
