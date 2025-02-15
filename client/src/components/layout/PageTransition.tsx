import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.2, 
        ease: [0.4, 0, 0.2, 1] // Use cubic-bezier for smoother easing
      }}
      style={{
        willChange: "transform", // Hint to browser to use hardware acceleration
        backfaceVisibility: "hidden", // Prevent flickering in some browsers
        WebkitFontSmoothing: "antialiased", // Smoother text rendering
        transform: "translateZ(0)" // Force GPU acceleration
      }}
    >
      {children}
    </motion.div>
  );
}