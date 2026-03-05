"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Add the animated shimmer sweep effect */
  shimmer?: boolean;
  /** Add an iridescent border glow */
  irisBorder?: boolean;
  /** Framer Motion variants (optional) */
  animate?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  shimmer = false,
  irisBorder = false,
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const classes = [
    "glass rounded-2xl",
    shimmer ? "glass-shimmer" : "",
    irisBorder ? "iris-border" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!animate) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
