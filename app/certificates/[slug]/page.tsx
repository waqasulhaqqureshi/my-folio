"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { certificateDetails } from "../../reviews-section/certificateDetails";

const CertificateDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string);

  const cert = useMemo(
    () => certificateDetails.find((c) => c.slug === slug),
    [slug]
  );

  if (!cert) {
    // Simple not-found experience
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0E1016] p-8 text-center text-white">
        <div>
          <p className="mb-6 text-xl">Certificate not found.</p>
          <Link href="/" className="rounded-md bg-white/10 px-4 py-2 text-white hover:bg-white/20">Go Home</Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    // Prefer history back; if none, fallback to homepage certificates anchor
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/#certificates");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1016]">
      {/* Header actions */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6">
        <button
          onClick={handleBack}
          className="rounded-lg border-2 border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
          aria-label="Go back"
        >
          ← Back
        </button>
        <a
          href={cert.detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border-2 border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
        >
          View on original site ↗
        </a>
      </div>

      {/* 16:9 Preview */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#212531]">
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

      {/* Details */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center gap-4">
          <Image
            src={cert.organizationLogo}
            alt={cert.organizationName}
            width={72}
            height={72}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-extrabold uppercase text-[#e4ded7]">{cert.organizationName}</h1>
            <p className="text-sm text-[#95979D]">Certification</p>
          </div>
        </div>

        <p className="max-w-3xl text-lg leading-relaxed text-[#e4ded7]">{cert.certificateDetails}</p>
      </div>
    </div>
  );
};

export default CertificateDetailPage;


