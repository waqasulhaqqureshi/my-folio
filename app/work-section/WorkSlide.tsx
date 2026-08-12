"use client";

import Image from "next/image";
import type { Project } from "../lib/projectTypes";
import { useLazyVideo } from "../hooks/useLazyVideo";
import type { DeviceKind } from "./DeviceFrame";

/*
 * WorkSlide — the media inside the device screen.
 *
 * Each project owns its own media per device: `video`/`image` fill the tablet,
 * `mobileVideo`/`mobileImage` fill the phone. One shared clip across all
 * projects was tried and rejected — the frame would show a recording of a
 * different product than the title beside it, which breaks the whole premise
 * of a project carousel.
 *
 * A project with no phone recording falls back to its portrait still rather
 * than an empty frame, so a project can be added without a phone capture.
 */
export default function WorkSlide({
  project,
  kind,
}: {
  project: Project;
  kind: DeviceKind;
}) {
  const src = kind === "mobile" ? project.mobileVideo : project.video;
  const poster = kind === "mobile" ? project.mobileImage : project.image;

  // No clip for this device: render the still alone. Mounting <video> with an
  // empty src would make the browser request the page URL as a media file.
  if (!src) return <StillSlide poster={poster} name={project.name} kind={kind} />;

  return <VideoSlide src={src} poster={poster} name={project.name} kind={kind} />;
}

function StillSlide({
  poster,
  name,
  kind,
}: {
  poster: string;
  name: string;
  kind: DeviceKind;
}) {
  if (!poster) {
    return (
      <div className="work-slide">
        <div className="work-slide-media work-slide-empty" aria-hidden="true" />
        <span className="sr-only">{name} — no preview available</span>
      </div>
    );
  }
  return (
    <div className="work-slide">
      <div className="work-slide-media">
        <Image
          src={poster}
          alt={`${name} — ${kind} preview`}
          fill
          sizes={kind === "mobile" ? "(max-width: 767px) 62vw, 22vw" : "(max-width: 767px) 62vw, 27vw"}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/*
 * Split from the branch above so the video hook is only called when there IS a
 * video — calling it before the early return would break the rules of hooks.
 */
function VideoSlide({
  src,
  poster,
  name,
  kind,
}: {
  src: string;
  poster: string;
  name: string;
  kind: DeviceKind;
}) {
  const { videoRef, state } = useLazyVideo(src);

  return (
    <div className="work-slide">
      <div className="work-slide-media">
        {/* Poster stays beneath until playback starts, so a slow clip shows the
            still rather than a black rectangle. */}
        {poster && (
          <Image
            src={poster}
            alt={`${name} — ${kind} preview`}
            fill
            sizes={kind === "mobile" ? "(max-width: 767px) 62vw, 22vw" : "(max-width: 767px) 62vw, 27vw"}
            className="object-cover"
            data-hidden={state === "active" ? "true" : "false"}
          />
        )}
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
