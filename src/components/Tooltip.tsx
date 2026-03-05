"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  children,
  content,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionClasses: Record<string, string> = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full  left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full  top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<string, string> = {
    top:    "top-full  left-1/2 -translate-x-1/2 border-t-[#1e2030] border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1e2030] border-l-transparent border-r-transparent border-t-transparent",
    left:   "left-full  top-1/2 -translate-y-1/2 border-l-[#1e2030] border-t-transparent border-b-transparent border-r-transparent",
    right:  "right-full top-1/2 -translate-y-1/2 border-r-[#1e2030] border-t-transparent border-b-transparent border-l-transparent",
  };

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit ={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`pointer-events-none absolute z-50 w-max max-w-xs ${positionClasses[position]}`}
          >
            {/* Arrow */}
            <span
              className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
            />

            {/* Body */}
            <div
              className="rounded-xl px-3 py-2 text-xs leading-relaxed text-slate-200 shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(30,32,48,0.97) 0%, rgba(20,22,40,0.97) 100%)",
                border: "1px solid rgba(167,139,250,0.2)",
                backdropFilter: "blur(16px)",
              }}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
