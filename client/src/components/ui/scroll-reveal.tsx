import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

type Offset = {
  x?: number;
  y?: number;
};

export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0 
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionOffset: Record<NonNullable<ScrollRevealProps["direction"]>, Offset> = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: directionOffset[direction].x ?? 0,
        y: directionOffset[direction].y ?? 0
      }}
      animate={{
        opacity: isInView ? 1 : 0,
        x: isInView ? 0 : (directionOffset[direction].x ?? 0),
        y: isInView ? 0 : (directionOffset[direction].y ?? 0)
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 1.02, 0.73, 0.99]
      }}
    >
      {children}
    </motion.div>
  );
}