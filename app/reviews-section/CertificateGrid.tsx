import CertificateCarousel from "./CertificateCarousel";
import AnimatedBody from "../animations/AnimatedBody";

/*
 * Certificates — nm design system. Heading block identical in spirit to Work
 * (eyebrow pill + display h2 + right-aligned copy) so all sections read as
 * one continuous page under the hero.
 */
const Certificates = () => {
  return (
    <section
      id="certificates"
      className="nm-section nm-section--tight z-10"
      aria-label="Certificates"
    >
      <div className="nm-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col items-start gap-4 md:gap-5">
            <span className="nm-eyebrow">Credentials</span>
            <h2 className="nm-h2">Certificates</h2>
          </div>
          <AnimatedBody
            text="Professional certifications and educational achievements."
            className="nm-body max-w-full md:max-w-[32ch] md:text-right"
          />
        </div>

        <div className="mt-6 md:mt-8">
          <CertificateCarousel />
        </div>
      </div>
    </section>
  );
};

export default Certificates;
