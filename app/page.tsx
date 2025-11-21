"use client";
import Hero from "./hero-section/Hero";
import useBlobity from "blobity/lib/react/useBlobity";
import { useEffect } from "react";
import PreLoader from "./animations/PreLoader/PreLoader";
import { initialBlobityOptions } from "./utils/BlobityConfig";
import NavBar from "./navbar/NavBar";

import dynamic from "next/dynamic";
import Certificates from "./reviews-section/CertificateGrid";
const Work = dynamic(() => import("./work-section/Work"));
const About = dynamic(() => import("./about-section/About"));
const Blog = dynamic(() => import("./blog-section/BlogGrid"));
const Contact = dynamic(() => import("./contact-section/Contact"));
const Footer = dynamic(() => import("./footer/Footer"));

export default function Home() {
  const blobityInstance = useBlobity(initialBlobityOptions);

  useEffect(() => {
    // Blobity instance is initialized and ready for use
    if (blobityInstance.current) {
      // Instance available for interactive elements
    }
  }, [blobityInstance]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <>
      <PreLoader />

      <NavBar />

      <main className="flex flex-col items-center justify-center">
        <Hero />
        <Work />
        <Certificates/>
        <About />
        <Blog />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
