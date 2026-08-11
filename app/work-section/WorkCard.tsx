"use client";
import Image from "next/image";
import { ProjectProps } from "./projectDetails";
import { useLazyVideo } from "../hooks/useLazyVideo";

/*
 * WorkCard — port of the source's `a.work-card`:
 *
 *   a.work-card
 *     ├── img.work-image                 (object-fit:cover, absolute fill)
 *     ├── div.work-image-overlay         (#0009, opacity 0 → 1 on hover)
 *     └── div.work-card-content          (gradient scrim, flex column)
 *           ├── .work-card-content-top-layout   → index + .work-label-wrap
 *           ├── .work-card-content-bottom-layout→ h3 + description
 *           └── .work-card-arrow-wrap           → yellow circular FAB
 *
 * Media: the source uses a static <img>; here the same reserved box also hosts
 * a LOCAL lazy <video> (public/videos) that fades in over the poster once it
 * plays, and is fully released when scrolled away.
 */
type WorkCardProps = ProjectProps & { position: number };

const WorkCard = ({
  name,
  description,
  technologies,
  demo,
  image,
  video,
  position,
}: WorkCardProps) => {
  const index = String(position + 1).padStart(2, "0");
  const { videoRef, state } = useLazyVideo(video);

  return (
    <a
      href={demo}
      target="_blank"
      rel="noopener noreferrer"
      className="work-card"
      aria-label={`${name} — open project in a new tab`}
    >
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        fill
        sizes="(max-width: 767px) 83vw, 27vw"
        className="work-image"
        data-hidden={state === "active" ? "true" : "false"}
      />

      <video
        ref={videoRef}
        className="work-video"
        data-state={state}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Source: .work-image-overlay — #0009 wash revealed on hover */}
      <span className="work-image-overlay" aria-hidden="true" />

      <div className="work-card-content">
        <div className="work-card-content-top-layout">
          <div className="work-card-index">{index}</div>
          <div className="work-label-wrap">
            {technologies.map((tech) => (
              <div key={tech} className="work-label">
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="work-card-content-bottom-layout">
          <h3 className="work-card-heading">{name}</h3>
          <p className="op80">{description}</p>
        </div>

        <div className="work-card-arrow-wrap" aria-hidden="true">
          <div className="work-card-arrow-icon">
            <svg
              className="work-card-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
            <svg
              className="work-card-arrow work-card-arrow-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
};

export default WorkCard;
