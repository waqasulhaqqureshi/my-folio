"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { certificateDetails } from "../../reviews-section/certificateDetails";

/*
 * Certificate detail view — re-themed to the nm design system
 * (beige canvas, glass panes, yellow CTAs, Tr 3 A headings).
 */
const CertificateDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : (params?.slug as string);

  const cert = useMemo(
    () => certificateDetails.find((c) => c.slug === slug),
    [slug]
  );

  if (!cert) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-8 text-center text-ink">
        <div>
          <p className="nm-h3 mb-6">Certificate not found.</p>
          <Link href="/" className="nm-btn">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/#certificates");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Header actions */}
      <div className="nm-container flex max-w-6xl items-center justify-between gap-4 py-6">
        <button onClick={handleBack} className="nm-btn-ghost" aria-label="Go back">
          ← Back
        </button>
        {cert.detailUrl && (
          <a
            href={cert.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nm-btn"
          >
            View on original site ↗
          </a>
        )}
      </div>

      {/* 16:9 Preview */}
      <div className="nm-container max-w-6xl">
        <div className="nm-card p-3 md:p-4">
          <div className="nm-plate relative w-full overflow-hidden rounded-[var(--radius-inner)]">
            <div className="aspect-[16/9] w-full">
              <Image
                src={cert.certificateImage}
                alt={`Certificate from ${cert.organizationName}`}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="nm-container max-w-6xl py-10">
        <div className="mb-5 flex items-center gap-4">
          <span className="nm-pane flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src={cert.organizationLogo}
              alt={cert.organizationName}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold uppercase text-ink">
              {cert.organizationName}
            </h1>
            <p className="nm-small text-ink/55">Certification</p>
          </div>
        </div>

        <p className="nm-body max-w-3xl leading-relaxed">
          {cert.certificateDetails}
        </p>
      </div>
    </div>
  );
};

export default CertificateDetailPage;
