"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-white/20 border-t-orange-400"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            ReClaim
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Reconnecting what matters
          </p>
        </div>
      </div>
    </div>
  );
}
