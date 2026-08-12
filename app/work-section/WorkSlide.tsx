"use client";

import Image from "next/image";
import { ProjectProps } from "./projectDetails";
import { useLazyVideo } from "../hooks/useLazyVideo";

/*
 * WorkSlide — the media that sits inside the device screen.
 *
 * Only the ACTIVE project renders this component, so exactly one <video> is
 * ever mounted. That is the whole reason the one-at-a-time layout is cheaper
 * than the 3-up rail: previously every card in the track held its own decoder
 * (useLazyVideo evicted off-screen ones, but three were live at any moment).
 * Here it is always one, and useLazyVideo's unmount teardown runs the full
 * WHATWG media reset on every slide change.
 *
 * The poster <Image> stays beneath the video and is only hidden once playback
 * actually starts, so a slow-loading clip shows the still rather than a black
 * rectangle.
 */
export default function WorkSlide({ project }: { project: ProjectProps }) {
  const { videoRef, state } = useLazyVideo(project.video);

  return (
    <div className="work-slide">
      <div className="work-slide-media">
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
