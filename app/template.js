"use client"

import { motion } from "framer-motion"

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.35,
      }}
    >
      {children}
    </motion.div>
  )
}