"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      {/* Premium subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Soft color radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-8 px-4 text-center">
        {/* Terminal Header & Typed Text */}
        <div className="space-y-3">
          <div className="text-xs text-zinc-600 tracking-[0.2em] uppercase">System Status</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-zinc-100 flex items-center justify-center gap-1">
            <span>{displayedText}</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
              className="inline-block w-[12px] h-[32px] md:h-[44px] bg-emerald-400 align-middle shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            />
          </h1>
        </div>

        {/* Interactive Dot & Anchored Chat Bubble */}
        <div className="relative flex flex-col items-center justify-center h-32 w-full max-w-sm">
          <AnimatePresence>
            {showButton && (
              <div className="relative flex flex-col items-center">
                {/* Chat Bubble Popup (Anchored directly above the dot) */}
                <AnimatePresence>
                  {showPopup && (
                    <motion.div
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: -16, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", damping: 15, stiffness: 220 }}
                      className="absolute bottom-full mb-3 z-20 w-72 rounded-2xl border border-emerald-500/20 bg-zinc-900/95 px-4 py-3 text-emerald-400 text-sm shadow-[0_8px_32px_rgba(16,185,129,0.15)] backdrop-blur-md leading-relaxed select-none"
                    >
                      <p className="font-mono font-medium text-center flex flex-col gap-1 items-center">
                        <span className="whitespace-nowrap">AAPKA MAINTENANCE BHI KAREGE 😌,</span>
                        <span className="whitespace-nowrap">ABHI JAAO PADHO 😤</span>
                      </p>
                      {/* Triangle Arrow pointing down to the dot */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-t-[8px] border-t-zinc-900/95 border-x-[8px] border-x-transparent" />
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

