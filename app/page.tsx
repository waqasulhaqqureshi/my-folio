"use client";
import Hero from "./hero-section/Hero";
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
 * Cursor refactor: the legacy blobity custom-cursor (animated DOM mouse
 * follower) is removed — the app now runs on native OS cursors only
 * (`cursor-default` / `cursor-pointer`). All CSS hover states, transitions
 * and micro-interactions on interactive elements are untouched.
 */
export default function Home() {
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
        <Certificates />
        <About />
        <Blog />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
