"use client";

import { ReactNode } from "react";

/*
 * DeviceFrame — tablet bezel drawn entirely in CSS.
 *
 * WHY CSS AND NOT A PNG MOCKUP
 * A bitmap bezel has to be pixel-matched to the screen area, which means the
 * video must be absolutely positioned against a fixed image. Any responsive
 * resize then drifts: the video creeps out from under the bezel by a pixel or
 * two, and the illusion collapses. Drawing the frame as a border around the
 * screen box makes the two mathematically inseparable at every size, costs no
 * extra network request, and stays crisp on any DPI.
 *
 * The screen's aspect ratio is 778/1100 — the intrinsic size of every clip in
 * public/videos. Matching it exactly means object-fit never crops or letterboxes.
 */
export default function DeviceFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`device-frame ${className}`}>
      <div className="device-body">
        {/* Front camera. aria-hidden: pure decoration. */}
        <span className="device-camera" aria-hidden="true" />
        <div className="device-screen">{children}</div>
      </div>
    </div>
  );
}
