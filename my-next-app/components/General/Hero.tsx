"use client";
import React from "react";
import { Heart, Stethoscope, Droplets } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative w-full py-20 animate-blueShift"> 
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          {/* Main content - centered */}
          <div className="w-full max-w-6xl m-auto">
            <div className="hero-content mt-15">
              
              <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white font-[var(--font-heading)]">
                Revolutionizing <span className="text-red-300">Blood Cancer</span> Care <br />with AI-Powered Intelligence
              </h1>

              <p className="mb-8 max-w-3xl text-lg sm:text-xl text-white/90 mx-auto font-medium leading-relaxed tracking-tight">
                HemaAI leverages cutting-edge artificial intelligence for early detection, precise diagnosis, 
                and personalized treatment pathways for blood cancer patients. Save lives with smarter healthcare.
              </p>

              {/* Larger Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <a
                  href="/patients"
                  className="inline-flex items-center gap-3 rounded-full border-2 border-white
                text-white px-8 py-4 text-lg font-semibold
               backdrop-blur-sm hover:bg-white hover:text-blue-500
               shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
                >
                  <Heart className="w-5 h-5" />
                  Patient
                </a>
                <a
                  href="/doctors"
                  className="inline-flex items-center gap-3 rounded-full border-2 border-white
                text-white px-8 py-4 text-lg font-semibold
               backdrop-blur-sm hover:bg-white hover:text-blue-500
               shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
                >
                  <Stethoscope className="w-5 h-5" />
                  Doctor
                </a>
                <a
                  href="/donors"
                  className="inline-flex items-center gap-3 rounded-full border-2 border-white
                text-white px-8 py-4 text-lg font-semibold
               backdrop-blur-sm hover:bg-white hover:text-blue-500
               shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
                >
                  <Droplets className="w-5 h-5" />
                  Donor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;