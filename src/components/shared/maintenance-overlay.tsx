"use client";

import { motion } from "framer-motion";
import { Wrench, Heart, Sparkles, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function MaintenanceOverlay() {
  const [clicked, setClicked] = useState(false);
  const [interactionText, setInteractionText] = useState("");

  const handleInteractiveClick = () => {
    setClicked(true);
    const responses = [
      "A distraction blocker? Or maybe just some attention... 😉",
      "Focus mode: ACTIVATED. (But I see you're distracted) 💚",
      "Saurabh says: Get back to... wait, the site is under maintenance. You have an excuse now! 😂",
      "Under your blanket, studying hard? I hope so! 📖✨",
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setInteractionText(randomResponse);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Dynamic Floating Background Blobs */}
      <motion.div
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-[100px]"
        animate={{
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-4 w-full max-w-xl rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
      >
        {/* Animated Icons Top Area */}
        <div className="relative mb-8 flex justify-center gap-4">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <Wrench className="h-8 w-8 animate-pulse" />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400"
          >
            <Heart className="h-4 w-4 fill-rose-400" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
        </div>

        {/* Text Headers */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl"
        >
          Under Maintenance
        </motion.h1>

        {/* The requested playful quote */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-lg font-medium leading-relaxed text-slate-200 sm:text-xl"
        >
          “this site is under maintanance, do you also wanna be under something ;)”
        </motion.div>

        {/* Interactive Element */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <button
            onClick={handleInteractiveClick}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <MessageSquare className="h-4 w-4" />
            <span>Click for a reply</span>
          </button>
        </motion.div>

        {/* Conditional Response area */}
        {clicked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-teal-500/10 bg-teal-950/20 p-4 text-sm font-medium text-emerald-300"
          >
            {interactionText}
          </motion.div>
        )}

        {/* Subtle Brand/Owner Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-xs text-slate-500"
        >
          Pranjal's Study Buddy • Maintenance Mode
        </motion.div>
      </motion.div>
    </div>
  );
}
