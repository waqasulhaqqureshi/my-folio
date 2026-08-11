"use client";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { lockScroll, unlockScroll } from "../lib/scrollLock";

/*
 * CertificateModal — same props/behavior as before (portal, ESC close,
 * body scroll-lock, external credential link), re-themed to the nm
 * system: beige glass pane, ink type, yellow primary action.
 */
type CertificateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  certificateImage: StaticImageData;
  organizationName: string;
  organizationLogo: StaticImageData;
  certificateDetails: string;
  detailUrl: string;
  certificateTitle?: string;
  recipientName?: string;
  achievementDescription?: string;
  awardedBy?: string;
  signatory?: {
    name: string;
    title: string;
  };
  location?: string;
  issueDate?: string;
  curriculumDetails?: string[];
};

const CertificateModal = ({
  isOpen,
  onClose,
  certificateImage,
  organizationName,
  organizationLogo,
  certificateDetails,
  detailUrl,
  certificateTitle,
  recipientName,
  achievementDescription,
  awardedBy,
  signatory,
  location,
  issueDate,
  curriculumDetails,
}: CertificateModalProps) => {
  const handleExternalLink = () => {
    if (detailUrl) {
      window.open(detailUrl, "_blank", "noopener,noreferrer");
    }
  };


  /* Ref-counted lock: acquire ONLY while open, release exactly once. A modal
     that is merely mounted-but-closed must not touch the global scroll state. */
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${organizationName} certificate details`}
        >
          <motion.div
            className="nm-pane nm-pad-l max-h-[90vh] w-full max-w-3xl overflow-y-auto text-ink scrollbar-hide"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="nm-pane flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full md:h-14 md:w-14">
                  <Image
                    src={organizationLogo}
                    alt={organizationName}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <p className="nm-small uppercase tracking-wide text-ink/60">
                    {certificateTitle ?? "Certificate"}
                  </p>
                  <h3 className="font-display text-lg font-medium uppercase leading-tight text-ink md:text-2xl">
                    {organizationName}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close certificate preview"
                className="nm-btn-ghost h-10 w-10 shrink-0 rounded-full p-0"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Scan */}
            <div className="nm-plate mb-4 overflow-hidden rounded-[var(--radius-inner)] md:mb-6">
              <div className="relative aspect-[16/11] w-full">
                <Image
                  src={certificateImage}
                  alt={`Certificate from ${organizationName}`}
                  fill
                  sizes="(max-width: 768px) 92vw, 720px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Details */}
            <p className="nm-body mb-4 leading-relaxed">{certificateDetails}</p>

            {(recipientName || issueDate || location) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {recipientName && (
                  <span className="nm-chip">Awarded to {recipientName}</span>
                )}
                {issueDate && <span className="nm-chip">{issueDate}</span>}
                {location && <span className="nm-chip">{location}</span>}
                {achievementDescription && (
                  <span className="nm-chip bg-accent">{achievementDescription}</span>
                )}
              </div>
            )}

            {curriculumDetails && curriculumDetails.length > 0 && (
              <ul className="mb-6 grid gap-2 sm:grid-cols-2">
                {curriculumDetails.map((item) => (
                  <li
                    key={item}
                    className="nm-small flex items-start gap-2 text-ink/70"
                  >
                    <span
                      className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent ring-1 ring-ink/60"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {(signatory || awardedBy || detailUrl) && (
              <div className="flex flex-col gap-4 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="nm-small text-ink/70">
                  {signatory && (
                    <p>
                      {signatory.name}
                      {signatory.title ? ` — ${signatory.title}` : ""}
                    </p>
                  )}
                  {awardedBy && <p className="text-ink/50">{awardedBy}</p>}
                </div>
                {detailUrl && (
                  <button
                    onClick={handleExternalLink}
                    className="nm-btn w-full sm:w-auto"
                  >
                    Verify credential
                    <FontAwesomeIcon
                      icon={faExternalLink}
                      className="text-[12px]"
                    />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CertificateModal;
