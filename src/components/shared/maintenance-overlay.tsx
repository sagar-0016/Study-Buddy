"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import cordeliaImg from "@/assets/Cordelia Cruises.jpg";

export default function MaintenanceOverlay() {
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const fullText = "UNDER MAINTENANCE";

  // Typewriter effect
  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 120);
      return () => clearTimeout(timeoutId);
    } else {
      setTypingComplete(true);
    }
  }, [displayedText]);

  // Show button after typing is complete
  useEffect(() => {
    if (typingComplete) {
      const timeoutId = setTimeout(() => {
        setShowButton(true);
      }, 600);
      return () => clearTimeout(timeoutId);
    }
  }, [typingComplete]);

  return (
    <div 
      onClick={() => setShowPopup(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-zinc-950 font-mono text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300"
    >
      {/* Background image at 20% brightness */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={cordeliaImg}
          alt="Background"
          fill
          className="object-cover brightness-[0.20]"
          priority
        />
      </div>

      {/* Premium subtle background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />


      <div className="z-10 flex flex-col items-center gap-8 px-4 text-center">
        {/* Terminal Header & Typed Text */}
        <div className="space-y-3">
          <div className="text-xs text-zinc-600 tracking-[0.2em] uppercase">System Status</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-white flex items-center justify-center gap-1">
            <span>{displayedText}</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
              className="inline-block w-[12px] h-[32px] md:h-[44px] bg-emerald-400 align-middle shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            />
          </h1>
        </div>

        <div className="relative flex flex-col items-center justify-center h-16 w-full max-w-sm">
          <AnimatePresence>
            {showButton && (
              <div className="relative flex items-center justify-center">
                {/* Chat Bubble Popup (Anchored directly to the right of the dot) */}
                <AnimatePresence>
                  {showPopup && (
                    <motion.div
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, x: 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 20, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.95 }}
                      transition={{ type: "spring", damping: 15, stiffness: 220 }}
                      className="absolute left-full top-[3px] ml-3 z-20 w-72 rounded-2xl rounded-tl-none bg-white p-4 text-zinc-950 text-sm shadow-2xl leading-relaxed select-none border-none"
                    >
                      <p className="font-mono font-medium text-center flex flex-col gap-1 items-center">
                        <span className="whitespace-nowrap">AAPKA MAINTENANCE BHI KAREGE 😌,</span>
                        <span className="whitespace-nowrap">ABHI JAAO PADHO 😤</span>
                      </p>
                      {/* Triangle Arrow pointing left to the dot (chat tail style flush with top) */}
                      <div className="absolute right-full top-0 w-0 h-0 border-r-[8px] border-r-white border-b-[8px] border-b-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The Dot Button itself */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopup((prev) => !prev);
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 focus:outline-none shadow-[0_0_12px_rgba(16,185,129,0.7)] cursor-pointer"
                  aria-label="Toggle Message"
                >
                  {/* Ping animation wrapper */}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle Bottom watermark */}
      <div className="absolute bottom-6 text-[10px] text-zinc-700 tracking-wider">
        STUDY BUDDY v6.7
      </div>
    </div>
  );
}

