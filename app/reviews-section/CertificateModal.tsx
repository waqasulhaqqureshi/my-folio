"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StaticImageData } from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type CertificateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  certificateImage: StaticImageData;
  organizationName: string;
  organizationLogo: StaticImageData;
  certificateDetails: string;
  detailUrl: string;
  // Enhanced fields for detailed view
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

  const unlockBodyScroll = () => {
    if (typeof document !== "undefined") {
      try {
        // Explicitly set both overflow and overflow-y to ensure scrolling works
        document.body.style.overflow = "";
        document.body.style.overflowY = "scroll";
      } catch {}
    }
  };

  const lockBodyScroll = () => {
    if (typeof document !== "undefined") {
      try {
        document.body.style.overflow = "hidden";
        document.body.style.overflowY = "hidden";
      } catch {}
    }
  };

  // Handle body scroll lock/unlock based on modal state
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  // Push a history state when the modal opens and close on browser back
  useEffect(() => {
    if (!isOpen) return;
    const onPop = () => {
      unlockBodyScroll();
      onClose();
    };
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ certificateModal: true }, "");
      } catch {}
      window.addEventListener("popstate", onPop);
      return () => {
        window.removeEventListener("popstate", onPop);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  // Figure out portal target once per render
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  if (!portalTarget) return null;

  // Render the modal into a portal so transforms/overflow on parents don't clip it
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="certificate-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] min-h-screen overflow-y-auto bg-[#0E1016]"
        >
          {/* Full Page Content */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen"
          >
            {/* Header Actions */}
            <div className="fixed left-6 right-6 top-6 z-10 flex items-center justify-between">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    try {
                      unlockBodyScroll();
                      window.history.back();
                    } catch {
                      unlockBodyScroll();
                      onClose();
                    }
                  } else {
                    unlockBodyScroll();
                    onClose();
                  }
                }}
                className="rounded-lg border-2 border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                aria-label="Go back"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  unlockBodyScroll();
                  onClose();
                }}
                className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Close certificate view"
              >
                <FontAwesomeIcon icon={faXmark} className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Certificate Image - Square Frame */}
            <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 md:px-16 lg:px-20">
              <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl border-4 border-[#212531] bg-[#212531] shadow-2xl shadow-black/50 md:rounded-3xl md:border-[6px]">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent md:rounded-2xl"></div>
                <Image
                  src={certificateImage}
                  alt={`Certificate from ${organizationName}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 600px"
                  className="object-contain p-2 md:p-4"
                  priority
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="mx-auto max-w-4xl px-8 py-16">
              {/* Organization Info */}
              <div className="mb-8 flex items-center gap-4">
                <Image
                  src={organizationLogo}
                  alt={organizationName}
                  width={100}
                  height={100}
                  className="h-[80px] w-[80px] rounded-full object-cover border-2 border-[#212531]"
                />
                <div>
                  <h3 className="text-3xl font-bold uppercase text-[#e4ded7]">
                    {organizationName}
                  </h3>
                  <p className="text-base text-[#95979D]">Certification</p>
                </div>
              </div>

              {/* Certificate Title */}
              {certificateTitle && (
                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-[#e4ded7] mb-2">
                    {certificateTitle}
                  </h2>
                </div>
              )}

              {/* Recipient Name */}
              {recipientName && (
                <div className="mb-6">
                  <p className="text-sm text-[#95979D] mb-1">Awarded to</p>
                  <p className="text-2xl font-semibold text-[#e4ded7]">
                    {recipientName}
                  </p>
                </div>
              )}

              {/* Achievement Description */}
              {achievementDescription && (
                <div className="mb-6">
                  <p className="text-sm text-[#95979D] mb-2">Achievement</p>
                  <p className="text-xl font-medium text-[#e4ded7]">
                    {achievementDescription}
                  </p>
                </div>
              )}

              {/* Award Information Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {awardedBy && (
                  <div className="rounded-lg border border-[#212531] bg-[#212531]/50 p-4">
                    <p className="text-sm text-[#95979D] mb-1">Awarded By</p>
                    <p className="text-lg font-semibold text-[#e4ded7]">
                      {awardedBy}
                    </p>
                  </div>
                )}

                {issueDate && (
                  <div className="rounded-lg border border-[#212531] bg-[#212531]/50 p-4">
                    <p className="text-sm text-[#95979D] mb-1">Issue Date</p>
                    <p className="text-lg font-semibold text-[#e4ded7]">
                      {issueDate}
                    </p>
                  </div>
                )}

                {location && (
                  <div className="rounded-lg border border-[#212531] bg-[#212531]/50 p-4">
                    <p className="text-sm text-[#95979D] mb-1">Location</p>
                    <p className="text-lg font-semibold text-[#e4ded7]">
                      {location}
                    </p>
                  </div>
                )}

                {signatory && (
                  <div className="rounded-lg border border-[#212531] bg-[#212531]/50 p-4">
                    <p className="text-sm text-[#95979D] mb-1">Signed By</p>
                    <p className="text-lg font-semibold text-[#e4ded7]">
                      {signatory.name}
                    </p>
                    <p className="text-sm text-[#95979D] mt-1">
                      {signatory.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Curriculum Details */}
              {curriculumDetails && curriculumDetails.length > 0 && (
                <div className="mb-8">
                  <p className="text-lg font-semibold text-[#e4ded7] mb-4">
                    Curriculum Coverage
                  </p>
                  <ul className="space-y-3">
                    {curriculumDetails.map((detail, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-[#e4ded7]"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ded7]"></span>
                        <span className="text-base leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificate Description */}
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-[#e4ded7]">
                  {certificateDetails}
                </p>
              </div>

              {/* External Link Button - Only show if URL exists */}
              {detailUrl && (
                <button
                  onClick={handleExternalLink}
                  className="flex items-center gap-2 rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 transition-all hover:border-white/40 hover:bg-white/10"
                >
                  <span className="text-lg font-semibold text-[#e4ded7]">
                    View Certificate Online
                  </span>
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    className="h-5 w-5 text-[#e4ded7]"
                  />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
};

export default CertificateModal;

