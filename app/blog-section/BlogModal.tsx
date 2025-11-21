"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { createPortal } from "react-dom";

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
        window.history.pushState({ blogModal: true }, "");
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
          key="blog-modal"
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
                aria-label="Close blog view"
              >
                <FontAwesomeIcon icon={faXmark} className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Blog Image - Square Frame */}
            <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 md:px-16 lg:px-20">
              <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl border-4 border-[#212531] bg-[#212531] shadow-2xl shadow-black/50 md:rounded-3xl md:border-[6px]">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent md:rounded-2xl"></div>
                <Image
                  src={blogImage}
                  alt={blogTitle}
                  fill
                  sizes="(max-width: 768px) 90vw, 600px"
                  className="object-contain p-2 md:p-4"
                  priority
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="mx-auto max-w-4xl px-8 py-16">
              {/* Blog Info */}
              <div className="mb-8">
                <h3 className="mb-4 text-3xl font-bold uppercase leading-tight text-[#e4ded7] sm:text-4xl">
                  {blogTitle}
                </h3>
                <p className="text-base text-[#95979D]">{blogDate}</p>
              </div>

              {/* External Link Button */}
              <button
                onClick={handleExternalLink}
                className="flex items-center gap-2 rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 transition-all hover:border-white/40 hover:bg-white/10"
              >
                <span className="text-lg font-semibold text-[#e4ded7]">
                  Read Blog Post
                </span>
                <FontAwesomeIcon
                  icon={faExternalLink}
                  className="h-5 w-5 text-[#e4ded7]"
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
};

export default BlogModal;

