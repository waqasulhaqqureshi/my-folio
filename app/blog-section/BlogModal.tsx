"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { createPortal } from "react-dom";

/*
 * BlogModal — same props/behavior as before (portal, ESC, scroll-lock,
 * external link), re-themed to the nm palette: beige glass pane, ink type,
 * yellow "Read article" action.
 */
type BlogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  blogImage: string;
  blogTitle: string;
  blogDate: string;
  blogUrl: string;
};

const BlogModal = ({
  isOpen,
  onClose,
  blogImage,
  blogTitle,
  blogDate,
  blogUrl,
}: BlogModalProps) => {
  const handleExternalLink = () => {
    window.open(blogUrl, "_blank", "noopener,noreferrer");
  };

  const unlockBodyScroll = () => {
    if (typeof document !== "undefined") {
      try {
        document.body.style.overflow = "";
        document.body.style.overflowY = "";
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

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => unlockBodyScroll();
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
          aria-label={blogTitle}
        >
          <motion.div
            className="nm-pane nm-pad-l max-h-[90vh] w-full max-w-2xl overflow-y-auto text-ink scrollbar-hide"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4 md:mb-6">
              <span className="nm-chip bg-accent">{blogDate}</span>
              <button
                onClick={onClose}
                aria-label="Close article preview"
                className="nm-btn-ghost h-10 w-10 shrink-0 rounded-full p-0"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="nm-plate mb-4 overflow-hidden rounded-[var(--radius-inner)] md:mb-6">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={blogImage}
                  alt={blogTitle}
                  fill
                  sizes="(max-width: 768px) 92vw, 640px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <h3 className="nm-h3 mb-6 text-ink">{blogTitle}</h3>

            <div className="flex justify-end border-t border-ink/10 pt-4">
              <button onClick={handleExternalLink} className="nm-btn w-full sm:w-auto">
                Read article
                <FontAwesomeIcon icon={faExternalLink} className="text-[12px]" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BlogModal;
