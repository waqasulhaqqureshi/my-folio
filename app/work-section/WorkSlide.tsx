"use client";

import Image from "next/image";
import { ProjectProps } from "./projectDetails";
import { useLazyVideo } from "../hooks/useLazyVideo";
import type { DeviceKind } from "./DeviceFrame";

/*
 * WorkSlide — the media inside the device screen.
 *
 * WEB: the per-project .webm capture, lazily attached and fully released when
 * it leaves the viewport or the slide unmounts.
 *
 * MOBILE: one shared vertical strip (public/projects/mobile-strip.webp) of six
 * app screens, translated upward by a CSS keyframe. This replaced a set of
 * nine separate stills and an attempted animated WebP/APNG:
 *   - Pillow's WebP and GIF writers silently collapsed runs of similar frames
 *     (110 frames in, 25 out) and wrote a zero duration, so the animation
 *     never advanced.
 *   - The APNG that did encode correctly was 1.6MB for 9 seconds.
 *   - The strip is 217KB total, animates on the compositor (transform only,
 *     no per-frame decode), and needs no decoder at all.
 * The strip repeats its first screen at the end, so a linear 0 -> -85.7143%
 * loop wraps with no visible jump.
 */
export default function WorkSlide({
  project,
  kind,
}: {
  project: ProjectProps;
  kind: DeviceKind;
}) {
  if (kind === "mobile") {
    return (
      <div className="work-slide">
        <div className="work-slide-media">
          <div className="phone-scroll" aria-hidden="true">
            {/*
             * Plain <img>: next/image wants to fill its parent box, but this
             * element is deliberately ~15x taller than the frame so it can be
             * translated through it. Sizing is handled entirely in CSS.
             */}
            <img
              src="/projects/mobile-strip.webp"
              alt=""
              decoding="async"
              loading="lazy"
            />
          </div>
          <span className="sr-only">
            {project.name} — mobile app preview
          </span>
        </div>
      </div>
    );
  }

  return <WebSlide project={project} />;
}

/*
 * Split out so the video hook is only called on the web branch — calling it
 * above the `kind` check would break the rules of hooks the moment the mobile
 * early return fires.
 */
function WebSlide({ project }: { project: ProjectProps }) {
  const { videoRef, state } = useLazyVideo(project.video);

  return (
    <div className="work-slide">
      <div className="work-slide-media">
        {/* Poster stays beneath until playback starts, so a slow clip shows
            the still rather than a black rectangle. */}
        <Image
          src={project.image}
          alt={`${project.name} — site preview`}
          fill
          sizes="(max-width: 767px) 62vw, 27vw"
          className="object-cover"
          data-hidden={state === "active" ? "true" : "false"}
          priority={project.id === 0}
        />
        <video
          ref={videoRef}
          data-state={state}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
