import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedBody from "../animations/AnimatedBody";

/*
 * Footer — nm design system. Canvas background, hairline ink rule,
 * Tr 3 A uppercase microcopy — a quiet cadence close under the hero theme.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      /* pb clears the fixed bottom nav dock so it never overlaps footer content */
      className="w-full border-t border-ink/10 bg-canvas pb-28 pt-8 text-ink md:pb-32 md:pt-10"
      initial="initial"
      animate="animate"
      aria-label="Footer"
    >
      <div className="nm-container flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <AnimatedBody
          text={`Copyright ${year}`}
          className="font-display text-[12px] font-medium uppercase tracking-wide md:text-[13px]"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <AnimatedBody
            text={"Design & Development by"}
            className="nm-small uppercase tracking-wide text-ink/60"
          />
          <Link href="" aria-label="Waqas Qureshi — GitHub profile">
            <span className="font-display text-[12px] font-medium uppercase tracking-wide underline underline-offset-4 transition-colors duration-300 hover:bg-accent md:text-[13px]">
              <AnimatedBody text={"Waqas Qureshi"} className="m-0 p-0" />
            </span>
          </Link>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
