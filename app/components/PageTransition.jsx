// components/PageTransition.jsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1], // smooth cubic bezier
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export default function PageTransition({ children }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // re-mounts on every route change
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}