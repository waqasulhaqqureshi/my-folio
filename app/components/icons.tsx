/*
 * Inline icon set — replaces @fortawesome/react-fontawesome.
 *
 * WHY THE LIBRARY WAS DROPPED
 * Next 16 compiles against React 19 (19.3 canary, vendored), and React 19
 * REMOVED `defaultProps` support for function components. FontAwesomeIcon
 * ships its defaults that way:
 *
 *     FontAwesomeIcon.defaultProps = { className: '', ... }
 *
 * and then does `className.split(' ')` unconditionally at index.js:348. With
 * defaultProps ignored, `className` is undefined for every call site that
 * omits it, so the component throws
 *   "Cannot read properties of undefined (reading 'split')"
 * during render. The nearest error boundary catches it, which is why opening
 * any certificate or blog modal showed "Something went wrong!".
 *
 * react-fontawesome 0.2.0 is the current release and has no React 19 fix, so
 * pinning or upgrading is not an option. These three icons are trivial paths;
 * inlining them removes the dependency from the render path entirely, drops
 * the client bundle, and cannot regress on a future React change.
 *
 * Paths are traced from the Font Awesome 6 Free solid glyphs (CC BY 4.0) on
 * their native 512-unit viewBox, so they are visually identical to what the
 * library rendered.
 */
type IconProps = {
  className?: string;
  title?: string;
};

const base = (className?: string) =>
  `inline-block h-[1em] w-[1em] shrink-0 fill-current align-[-0.125em] ${className ?? ""}`;

/** Font Awesome 6 Free · solid · xmark */
export const XmarkIcon = ({ className, title }: IconProps) => (
  <svg
    viewBox="0 0 384 512"
    className={base(className)}
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
  </svg>
);

/** Font Awesome 6 Free · solid · arrow-up-right-from-square */
export const ExternalLinkIcon = ({ className, title }: IconProps) => (
  <svg
    viewBox="0 0 512 512"
    className={base(className)}
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" />
  </svg>
);
