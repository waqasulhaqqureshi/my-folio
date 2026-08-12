"use client";

import { ReactNode } from "react";

export type DeviceKind = "web" | "mobile";

/*
 * DeviceFrame — tablet and phone bezels drawn entirely in CSS.
 *
 * WHY CSS AND NOT A PNG MOCKUP
 * A bitmap bezel must be pixel-matched to the screen area, so the media has to
 * be absolutely positioned against a fixed image. Any responsive resize then
 * drifts: the screen creeps out from under the bezel and the illusion breaks.
 * Drawing the frame as padding around the screen box makes the two
 * mathematically inseparable at every size, costs no request, and stays crisp
 * at any DPI.
 *
 * Screen ratios are the intrinsic ratios of the media they hold, so object-fit
 * never crops or letterboxes:
 *   web    → 778/1100  (the .webm captures)
 *   mobile → 704/1520  (the phone screens, ~9:19.5)
 */
export default function DeviceFrame({
  kind,
  children,
}: {
  kind: DeviceKind;
  children: ReactNode;
}) {
  return (
    <div className="device-frame" data-kind={kind}>
      <div className="device-body">
        {/* Phones get a notch; tablets a centred camera dot. Decorative. */}
        {kind === "mobile" ? (
          <span className="device-notch" aria-hidden="true" />
        ) : (
          <span className="device-camera" aria-hidden="true" />
        )}

        <div className="device-screen">{children}</div>

        {/* Home indicator — only phones have one. */}
        {kind === "mobile" && <span className="device-indicator" aria-hidden="true" />}
      </div>
    </div>
  );
}
