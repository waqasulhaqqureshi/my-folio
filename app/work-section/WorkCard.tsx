"use client";
import Image from "next/image";
import Link from "next/link";
import { ProjectProps } from "./projectDetails";
import { WorkMedia } from "./workMedia";
import { useLazyVideo } from "../hooks/useLazyVideo";
import { useMagnetic } from "../hooks/useMagnetic";

/*
 * WorkCard — grid cell (Phase 1) + local video node (Phase 2).
 *
 * SUBGRID CONTRACT
 * The card is itself a grid whose rows are inherited from the parent track via
 * `grid-template-rows: subgrid`. That is what makes every card's media frame,
 * title and meta row share a common baseline regardless of description length
 * — the thing a plain flex/auto-rows grid cannot do.
 *
 * ZERO-CLS MEDIA FRAME
 * The frame's height comes from `aspect-ratio` derived from the asset's
 * intrinsic 778×1100, applied in CSS before any media loads. The poster
 * <Image> and the <video> are both absolutely positioned inside that reserved
 * box, so swapping poster → video never reflows a single pixel.
 *
 * The <video> carries NO src attribute in markup: useLazyVideo attaches it on
 * approach and fully releases it (pause → drop src → load()) on exit.
 */
type WorkCardProps = ProjectProps & {
  position: number;
  media: WorkMedia;
};

const WorkCard = ({
  name,
  description,
  technologies,
  demo,
  image,
  available,
  position,
  media,
}: WorkCardProps) => {
  const index = String(position + 1).padStart(2, "0");
  const { videoRef, state } = useLazyVideo(media.src);
  const arrowRef = useMagnetic<HTMLSpanElement>({ strength: 0.45, padding: 16 });

  const href = available ? demo : "#work";

  return (
    <article className="work-cell" data-reveal>
      <Link
        href={href}
        target={available ? "_blank" : undefined}
        rel={available ? "noopener noreferrer" : undefined}
        className="work-card"
        aria-label={
          available
            ? `${name} — open live project in a new tab`
            : `${name} — coming soon`
        }
        aria-disabled={available ? undefined : true}
        onClick={available ? undefined : (e) => e.preventDefault()}
      >
        {/* Reserved media box: geometry is final on first paint. */}
        <div
          className="work-frame"
          style={{ aspectRatio: `${media.width} / ${media.height}` }}
        >
          <Image
            src={image}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            className="work-poster"
            data-hidden={state === "active" ? "true" : "false"}
          />

          {/*
           * No `src` here by design — attached imperatively by useLazyVideo.
           * `disableRemotePlayback` stops Chromium reserving a cast pipeline
           * for a purely decorative loop.
           */}
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
            width={media.width}
            height={media.height}
          />

          <span className="work-scrim" aria-hidden="true" />

          <span className="work-card-index" aria-hidden="true">
            {index}
          </span>

          {!available && <span className="work-flag">Coming soon</span>}

          <span
            ref={arrowRef}
            className="work-card-arrow-wrap"
            aria-hidden="true"
          >
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

        {/* Subgrid rows: title / description / stack all align across cards. */}
        <h3 className="work-card-heading">{name}</h3>
        <p className="work-card-desc">{description}</p>

        <ul className="work-label-wrap" aria-label={`${name} tech stack`}>
          {technologies.map((tech) => (
            <li key={tech} className="work-label">
              {tech}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
};

export default WorkCard;
