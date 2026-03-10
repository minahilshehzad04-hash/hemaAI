"use client";
import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ProblemStatement from "./HomeSections/ProblemStatement";

// Lazy-load below-the-fold sections to reduce initial bundle size
const SolutionSection  = dynamic(() => import("./HomeSections/SolutionSection"));
const PatientSection   = dynamic(() => import("./HomeSections/PatientSection"));
const DoctorSection    = dynamic(() => import("./HomeSections/DoctorSection"));
const ResourcesSection = dynamic(() => import("./HomeSections/ResourcesSection"));
const CtaSection       = dynamic(() => import("./HomeSections/CtaSection"));

const Homepage = () => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ProblemStatement addToRefs={addToRefs} />
      <SolutionSection addToRefs={addToRefs} />
      <PatientSection addToRefs={addToRefs} />
      <DoctorSection addToRefs={addToRefs} />
      <ResourcesSection addToRefs={addToRefs} />
      <CtaSection addToRefs={addToRefs} />


    </div>
  );
};

export default Homepage;