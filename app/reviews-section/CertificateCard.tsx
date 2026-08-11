"use client";
import { certificateProps } from "./certificateDetails";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import CertificateModal from "./CertificateModal";

/*
 * CertificateCard — nm glass card: framed scan inside a dark inlay plate,
 * organization row (logo chip + Tr 3 A name), hover reveals a yellow edge.
 * The detailed modal contract is unchanged.
 */
const CertificateCard = ({
  certificateImage,
  detailUrl,
  organizationName,
  organizationLogo,
  certificateDetails,
  index,
  slug,
  certificateTitle,
  recipientName,
  achievementDescription,
  awardedBy,
  signatory,
  location,
  issueDate,
  curriculumDetails,
}: certificateProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay: 0.1 * Math.abs(index % 3),
          ease: [0.44, 0, 0.22, 0.99],
        },
      }}
      viewport={{ amount: "some", once: true }}
      className="nm-card-framed group nm-pad flex w-full cursor-pointer flex-col items-stretch justify-between gap-5 transition-transform duration-300 hover:-translate-y-1"
    >
      <button
        onClick={handleOpen}
        aria-label={`Preview certificate from ${organizationName}`}
        className="nm-plate relative block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-inner)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="relative aspect-[16/11] w-full">
          <Image
            src={certificateImage}
            alt={`Certificate from ${organizationName}`}
            fill
            sizes="(max-width: 768px) 92vw, 420px"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 font-display text-[11px] font-medium uppercase leading-none tracking-wide text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Preview
        </span>
      </button>

      {/* Organization row */}
      <div className="flex w-full items-center gap-3 px-1 pb-1">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
          <Image
            src={organizationLogo}
            alt={organizationName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate font-display text-[15px] font-medium uppercase leading-tight tracking-wide text-cream md:text-[17px]">
            {organizationName}
          </h3>
          <p className="nm-small text-cream/60">Certification</p>
        </div>
        <span className="ml-auto font-display text-[12px] font-medium uppercase tracking-wide text-cream/45">
          {issueDate}
        </span>
      </div>

      {/* Detailed modal preview */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificateImage={certificateImage}
        organizationName={organizationName}
        organizationLogo={organizationLogo}
        certificateDetails={certificateDetails}
        detailUrl={detailUrl}
        certificateTitle={certificateTitle}
        recipientName={recipientName}
        achievementDescription={achievementDescription}
        awardedBy={awardedBy}
        signatory={signatory}
        location={location}
        issueDate={issueDate}
        curriculumDetails={curriculumDetails}
      />
    </motion.div>
  );
};

export default CertificateCard;
