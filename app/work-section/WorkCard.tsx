"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProjectProps } from "./projectDetails";

/*
 * WorkCard — structural port of heynesh.com's .work-card
 * (a.work-card > img.work-image + .work-card-content[top-layout, bottom-layout]
 *  + .work-card-arrow-wrap). Content slots are filled from projectDetails.
 */
type WorkCardProps = ProjectProps & { position: number };

const WorkCard = ({
  name,
  description,
  technologies,
  demo,
  image,
  available,
  position,
}: WorkCardProps) => {
  const index = String(position + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.05 * (position % 3),
        },
      }}
      viewport={{ once: true, amount: 0.25 }}
      className="shrink-0"
    >
      <Link
        href={available ? demo : "#work"}
        target={available ? "_blank" : undefined}
        rel={available ? "noopener noreferrer" : undefined}
        className="work-card"
        aria-label={`${name} — project ${index}`}
      >
        {/* Cover media (source: img.work-image, object-cover) */}
        <Image
          src={image}
          alt={`${name} preview`}
          fill
          sizes="(max-width: 768px) 83vw, 27vw"
          className="work-image"
        />

        {/* Gradient content layer */}
        <div className="work-card-content">
          <div className="work-card-content-top-layout">
            <span className="work-card-index">{index}</span>
            <div className="work-label-wrap" aria-label="Stack">
              {technologies.map((tech) => (
                <span key={tech} className="work-label">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="work-card-content-bottom-layout">
            <h3 className="work-card-heading">{name}</h3>
            <p className="op80">{description}</p>
          </div>

          <span className="work-card-arrow-wrap" aria-hidden="true">
            <svg
              className="work-card-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </span>
        </div>

        {!available && (
          <span className="nm-eyebrow nm-decor absolute left-4 top-4 z-10 bg-canvas/85 text-ink backdrop-blur-md">
            Coming soon
          </span>
        )}
      </Link>
    </motion.div>
  );
};

export default WorkCard;
