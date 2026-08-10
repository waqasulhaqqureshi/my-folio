import { reviewProps } from "./reviewDetails";
import Image from "next/image";
import { motion } from "framer-motion";

/*
 * ReviewCard — nm glass testimonial card.
 * Yellow oversized quote glyph (hero accent), body text in ink, avatar row
 * with grayscale→color hover (mirrors the hero portrait treatment).
 */
const ReviewCard = ({
  name,
  role,
  company,
  profileImg,
  testimonial,
  index,
}: reviewProps) => {
  const abbreviateName = (value: string): string => {
    const [firstName, lastName] = value.split(" ");
    return lastName ? `${firstName} ${lastName[0]}.` : firstName;
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 10 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay: 0.08 * (index % 3),
          ease: [0.44, 0, 0.22, 0.99],
        },
      }}
      viewport={{ amount: "some", once: true }}
      className="nm-card nm-pad flex h-full w-full flex-col items-start justify-between gap-8"
      aria-label={`Testimonial from ${name}`}
    >
      <span
        className="nm-decor font-display text-[64px] font-bold leading-[0.5] text-accent [text-shadow:-1px_0_0_#000,0_1px_0_#000,1px_0_0_#000,0_-1px_0_#000] md:text-[72px]"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <blockquote className="text-[15px] leading-relaxed text-ink/80 md:text-[16px]">
        {testimonial}
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3">
        <Image
          src={profileImg}
          alt={`${name} profile photo`}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover grayscale transition duration-300 hover:grayscale-0"
        />
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-[15px] font-medium uppercase leading-tight tracking-wide text-ink md:text-[16px]">
            {abbreviateName(name)}
          </h3>
          <p className="nm-small text-ink/55">
            {role} @ {company}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
};

export default ReviewCard;
