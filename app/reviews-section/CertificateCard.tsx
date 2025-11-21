"use client";
import { certificateProps } from "./certificateDetails";
import Image from "next/image";
import "../globals.css";
import { motion } from "framer-motion";
import { useState } from "react";
import CertificateModal from "./CertificateModal";

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
  const handleOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay: 0.1 * index,
          ease: [0.44, 0, 0.22, 0.99],
        },
      }}
      viewport={{
        amount: "some",
        once: true,
      }}
      className="relative flex h-[473px] w-[100%] cursor-pointer flex-col items-center justify-between rounded-[23px] border-[3px] border-[#212531] bg-transparent p-[28px] transition-all hover:border-[#e4ded7] hover:bg-[#212531]/50 sm:h-[450px] lg:h-[393px] lg:max-w-[438px]"
    >
      <button onClick={handleOpen} className="relative w-full flex-1 overflow-hidden rounded-[16px] focus:outline-none focus:ring-2 focus:ring-white/30">
        <Image
          src={certificateImage}
          alt={`Certificate from ${organizationName}`}
          width={438}
          height={250}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </button>

      {/* Organization Details */}
      <div className="mt-6 flex w-full items-center gap-4">
        <Image
          src={organizationLogo}
          alt={organizationName}
          width={60}
          height={60}
          className="h-[50px] w-[50px] rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="text-[20px] font-bold uppercase leading-[24px] text-[#e4ded7]">
            {organizationName}
          </h3>
          <p className="mt-1 text-sm font-[500] text-[#95979D]">
            Certification
          </p>
        </div>
      </div>

      {/* Full screen modal preview */}
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

