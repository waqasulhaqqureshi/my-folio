import Link from "next/link";
import Image from "next/image";
import "../animations/animate.css";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import AnimatedWords2 from "../animations/AnimatedWords2";
import { motion } from "framer-motion";
import heartIcon from "../../public/heart icon.png";

/*
 * Contact — nm design system. Giant Tr 3 A "Let's Talk" statement on the
 * beige canvas (same display rules as the hero heading block), yellow CTAs
 * and a social chip rail. The legacy heart keeps its heartbeat animation.
 */
const socials = [
  { label: "GH", href: "", aria: "View GitHub Profile" },
  { label: "LN", href: "", aria: "View LinkedIn Profile" },
  { label: "TW", href: "", aria: "View Twitter Profile" },
  { label: "IG", href: "", aria: "View Instagram Profile" },
  { label: "HN", href: "", aria: "View Hashnode Profile" },
];

const Contact = () => {
  return (
    <motion.section
      className="nm-section z-10 flex min-h-[85vh] flex-col justify-center"
      id="contact"
      initial="initial"
      animate="animate"
      aria-label="Contact"
    >
      <div className="nm-container flex flex-col">
        <div className="relative mb-10 flex flex-col items-start md:mb-14 md:items-center">
          <span className="nm-eyebrow mb-5 md:mb-6">Contact</span>

          <AnimatedWords2
            title={"Let's Talk"}
            style={
              "nm-display flex max-w-full flex-wrap items-start text-left uppercase text-ink md:items-center md:justify-center md:text-center"
            }
          />

          <Image
            src={heartIcon}
            alt=""
            aria-hidden="true"
            className="heartbeat absolute -bottom-6 right-2 w-[64px] md:-bottom-10 md:right-[12%] md:w-[96px] lg:w-[120px]"
          />
        </div>

        <div className="flex w-full flex-col gap-10 md:flex-row md:items-end md:justify-between">
          {/* Prompt + CTAs */}
          <div className="flex max-w-md flex-col items-start gap-6">
            <AnimatedBody
              text={
                "Got a question, proposal, project, or want to work together on something?"
              }
              className="nm-body text-ink/80"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Link href="" aria-label="Send me an email" className="nm-btn">
                Send me an email
              </Link>
              <span className="nm-small uppercase tracking-wide text-ink/50">
                or
              </span>
              <Link href="" aria-label="Book a call" className="nm-btn-ghost">
                Book a call
              </Link>
            </div>
          </div>

          {/* Social rail */}
          <ul
            className="flex flex-wrap items-center gap-2 md:justify-end"
            aria-label="Social profiles"
          >
            {socials.map((social) => (
              <li key={social.label}>
                <Link href={social.href} aria-label={social.aria}>
                  <AnimatedTitle
                    text={social.label}
                    className={
                      "nm-chip px-4 py-3 text-[14px] transition-colors duration-300 hover:bg-accent md:text-[16px]"
                    }
                    wordSpace={"mr-[0.25em]"}
                    charSpace={"mr-[0.01em]"}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
