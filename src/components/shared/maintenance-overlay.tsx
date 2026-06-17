"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Sparkles, User } from "lucide-react";

export default function MaintenanceOverlay() {
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const fullText = "UNDER MAINTENANCE";

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
        setTypingComplete(true);
      }
    }, 120);

    return () => clearInterval(intervalId);
  }, []);

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-zinc-950 font-mono text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
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

        {/* Textless Interactive Button */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  boxShadow: [
                    "0 0 0px rgba(16,185,129,0)",
                    "0 0 20px rgba(16,185,129,0.2)",
                    "0 0 0px rgba(16,185,129,0)"
                  ]
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  y: { duration: 0.4 },
                  boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.08, border: "1px solid rgba(16,185,129,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPopup(true)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-emerald-400 transition-colors focus:outline-none"
                aria-label="Interact"
              >
                <MessageCircle className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Chat-like Popup Modal */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-xl text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Chat Bubble Header / Sender info */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800/60">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-300">Saurabh</div>
                    <div className="text-[10px] text-zinc-500">Active now</div>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="relative rounded-2xl rounded-tl-none bg-emerald-600 px-4 py-3 text-zinc-100 text-sm shadow-md leading-relaxed">
                    <p className="font-sans font-medium">
                      AAPKA MAINTENANCE BHI KAREGE 😌, ABHI JAAO PADO 😤
                    </p>
                    {/* Tiny chat tail */}
                    <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-emerald-600 border-l-[8px] border-l-transparent" />
                  </div>
                </div>

                {/* Close/Acknowledge Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors focus:outline-none"
                  >
                    Okay, going to study!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle Bottom watermark */}
      <div className="absolute bottom-6 text-[10px] text-zinc-700 tracking-wider">
        STUDY BUDDY v1.0
      </div>
    </div>
  );
}

