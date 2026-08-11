"use client";
import Hero from "./hero-section/Hero";
import type { HeroContent } from "./lib/heroTypes";
import { useEffect } from "react";
import PreLoader from "./animations/PreLoader/PreLoader";
import NavBar from "./navbar/NavBar";

import dynamic from "next/dynamic";
import Certificates from "./reviews-section/CertificateGrid";
const Work = dynamic(() => import("./work-section/Work"));
const About = dynamic(() => import("./about-section/About"));
const Blog = dynamic(() => import("./blog-section/BlogGrid"));
const Contact = dynamic(() => import("./contact-section/Contact"));
const Footer = dynamic(() => import("./footer/Footer"));

/*
 * Cursor architecture: no custom pointer element exists. The app runs on
 * native OS cursors only (`cursor: default` / `cursor: pointer`, set in
 * globals.css). Pointer *physics* is not gone — it is decoupled and applied to
 * the elements themselves via useMagnetic(), which reads the invisible native
 * cursor coordinates in a rAF loop and drives compositor-only transforms.
 * See app/hooks/useMagnetic.ts.
 */
export default function HomeClient({ hero }: { hero: HeroContent }) {
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
        <Hero content={hero} />
        <Work />
        <Certificates />
        <About />
        <Blog />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
