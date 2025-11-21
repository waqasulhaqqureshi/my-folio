"use client";
import { blogProps } from "./blogDetails";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import BlogModal from "./BlogModal";
import "../globals.css";

const BlogCard = ({ title, image, url, date, available, index }: blogProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => {
    if (available) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
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
        className="relative flex h-[430px] w-[100%] max-w-[400px] cursor-pointer flex-col items-center justify-start rounded-2xl bg-[#212531] transition-all hover:border-[#e4ded7] hover:bg-[#212531]/50 sm:h-[450px] lg:h-[393px] lg:max-w-[438px]"
      >
        <div className="mt-4 h-[100%] w-[90%] lg:mt-5 lg:w-[92%]">
          <button
            onClick={handleOpen}
            className="relative h-[60%] w-full overflow-hidden rounded-lg md:h-[56%]"
            disabled={!available}
          >
            <Image
              src={image}
              alt={title}
              width={1600}
              height={840}
              className="h-full w-full bg-contain bg-center object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>

          <h3 className="mt-3 break-all uppercase leading-[1em] tracking-tight line-clamp-2 text-[#e4ded7]">
            {title}
          </h3>
        </div>

        <div className="absolute bottom-0 mb-5 flex w-[90%] items-center justify-between text-[14px] font-bold text-[#95979D]">
          {available ? (
            <p>{date}</p>
          ) : (
            <p>Coming soon</p>
          )}
        </div>
      </motion.div>

      {/* Full screen modal preview */}
      {available && (
        <BlogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          blogImage={image}
          blogTitle={title}
          blogDate={date}
          blogUrl={url}
        />
      )}
    </>
  );
};

export default BlogCard;
