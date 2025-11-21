"use client";
import ProjectCard from "./ProjectCard";
import { devProjects, ProjectProps } from "./projectDetails";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality with pause on hover
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % devProjects.length);
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? devProjects.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % devProjects.length);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      goToPrevious();
    } else if (info.offset.x < -swipeThreshold) {
      goToNext();
    }
  };

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel Container - wider with padding to maintain 10px gap from arrows */}
      {/* Arrows at 20px from edge, button ~48px wide, so card starts at 20+48+10=78px */}
      <div className="relative overflow-hidden pl-[78px] pr-[78px] md:pl-[82px] md:pr-[82px] lg:pl-[86px] lg:pr-[86px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1], // Custom easing for smooth animation
            }}
            className="w-full min-w-full"
          >
            <ProjectCard
              id={devProjects[currentIndex].id}
              name={devProjects[currentIndex].name}
              description={devProjects[currentIndex].description}
              technologies={devProjects[currentIndex].technologies}
              github={devProjects[currentIndex].github}
              demo={devProjects[currentIndex].demo}
              image={devProjects[currentIndex].image}
              available={devProjects[currentIndex].available}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="mt-8 flex justify-center gap-3">
        {devProjects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - 20px from edges */}
      <button
        onClick={goToPrevious}
        className="absolute left-[20px] top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Previous project"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6 text-white md:h-8 md:w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-[20px] top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
        aria-label="Next project"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6 text-white md:h-8 md:w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Progress Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-white/60">
          {currentIndex + 1}
        </span>
        <span className="text-sm text-white/40">/</span>
        <span className="text-sm font-semibold text-white/60">
          {devProjects.length}
        </span>
      </div>
    </div>
  );
};

export default ProjectCarousel;

