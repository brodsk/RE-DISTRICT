"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-6 md:right-10 z-50
                     flex flex-col items-center gap-1.5
                     group"
          aria-label="Scroll to top"
        >
          {/* Arrow line */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-0"
          >
            {/* Chevron */}
            <svg
              width="12" height="8" viewBox="0 0 12 8" fill="none"
              className="text-zinc-600 group-hover:text-white transition-colors duration-200"
            >
              <path d="M1 7L6 2L11 7" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
            </svg>
            {/* Vertical line */}
            <div className="w-px bg-zinc-800 group-hover:bg-zinc-500 transition-colors duration-200"
                 style={{ height: "28px" }} />
          </motion.div>
          {/* Label */}
          <span className="text-[7px] font-mono tracking-[0.3em] uppercase text-zinc-800
                           group-hover:text-zinc-600 transition-colors duration-200">
            TOP
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
