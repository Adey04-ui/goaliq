"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return { success: () => {}, error: () => {} }
  }
  return ctx
}

/* ─── Drawn Circle Icon with Splash ─── */
function ToastIcon({ type }) {
  const isSuccess = type === "success"
  const color = isSuccess ? "#22c55e" : "#ef4444"

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      {/* Expanding splash ring behind */}
      <motion.circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke={color}
        strokeWidth="3"
        initial={{ scale: 0.6, opacity: 0.5 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "16px 16px" }}
      />

      {/* Flying particles */}
      {[0, 90, 180, 270].map((deg, i) => (
        <motion.circle
          key={i}
          cx="16"
          cy="16"
          r="1.8"
          fill={color}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((deg * Math.PI) / 180) * 18,
            y: Math.sin((deg * Math.PI) / 180) * 18,
          }}
          transition={{ delay: 0.6 + i * 0.03, duration: 0.5, ease: "easeOut" }}
        />
      ))}

      {/* Colored fill that pops in after outline draws */}
      <motion.circle
        cx="16"
        cy="16"
        r="13"
        fill={color}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.35,
          duration: 0.35,
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
      />

      {/* White outline that draws first (like a pen) */}
      <motion.circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={color}
        strokeWidth=".5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />

      {/* Checkmark or X — draws in white on top */}
      {isSuccess ? (
        <motion.path
          d="M10 16l4 4 8-8"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
        />
      ) : (
        <>
          <motion.path
            d="M11 11l10 10"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, delay: 0.5, ease: "easeOut" }}
          />
          <motion.path
            d="M21 11l-10 10"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, delay: 0.6, ease: "easeOut" }}
          />
        </>
      )}
    </svg>
  )
}

/* ─── Single Toast ─── */
function ToastItem({ toast, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, x: 0, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, x: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 26, stiffness: 380 }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: "rgba(17, 24, 39, 0.96)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        minWidth: 300,
        maxWidth: 400,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <ToastIcon type={toast.type} />

      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>
          {toast.title}
        </span>
        {toast.message && (
          <span style={{ fontSize: 12, color: "#8896a8", lineHeight: 1.4 }}>
            {toast.message}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: "linear" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          transformOrigin: "left",
        }}
        onAnimationComplete={onRemove}
      />

      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#555",
          cursor: "pointer",
          padding: 4,
          marginRight: -4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

/* ─── Provider ─── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((title, message) => addToast("success", title, message), [addToast])
  const error = useCallback((title, message) => addToast("error", title, message), [addToast])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} style={{ pointerEvents: "auto" }}>
              <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}