"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1], // Apple / Cloudflare physics: instantaneous response with silky settle
      }}
      style={{ willChange: "transform, opacity, filter" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
