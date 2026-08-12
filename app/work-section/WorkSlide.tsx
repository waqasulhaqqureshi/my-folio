"use client";

import Image from "next/image";
import { ProjectProps } from "./projectDetails";
import { useLazyVideo } from "../hooks/useLazyVideo";
import type { DeviceKind } from "./DeviceFrame";

/*
 * WorkSlide — the media inside the device screen.
 *
 * Only the ACTIVE project renders this, so exactly one <video> is ever mounted.
 * That is what makes the one-at-a-time layout cheaper than the old 3-up rail,
 * where three decoders were live at once.
 *
 * The mobile view is a still image, so it mounts no <video> at all — switching
 * to the Mobile tab unmounts this component (see the key in Work.tsx), which
 * fires useLazyVideo's cleanup and runs the full WHATWG
 * pause/removeAttribute/load() reset. The decoder is released on tab switch
 * rather than left buffering behind a hidden panel.
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
          <Image
            src={project.mobile}
            alt={`${project.name} — mobile view`}
            fill
            sizes="(max-width: 767px) 46vw, 15vw"
            className="object-cover"
          />
        </div>
      </div>
    );
  }

  return <WebSlide project={project} />;
}

/*
 * Split into its own component so the video hook is only ever called on the
 * web branch. Calling useLazyVideo above the `kind` check would violate the
 * rules of hooks the moment the early return fires.
 */
function WebSlide({ project }: { project: ProjectProps }) {
  const { videoRef, state } = useLazyVideo(project.video);

  return (
    <div className="work-slide">
      <div className="work-slide-media">
        {/* Poster stays beneath until playback actually starts, so a slow
            clip shows the still rather than a black rectangle. */}
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
