"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedSectionProps {
  children:   React.ReactNode;
  className?: string;
  delay?:     number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const offsets: Record<NonNullable<AnimatedSectionProps["direction"]>, { x: number; y: number }> = {
    up:    { x: 0,   y: 24  },
    down:  { x: 0,   y: -24 },
    left:  { x: 32,  y: 0   },
    right: { x: -32, y: 0   },
    none:  { x: 0,   y: 0   },
  };

  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
