"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

export default function AIAssistant({
  onSubmit,
  className = "",
  title = "AI Assistant",
  subtitle = "Ask anything about sports...",
  placeholder = "Ask GOALIQ AI...",
}) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    try {
      await onSubmit?.(input.trim())
      setInput("")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`aiAssistant ${className}`}
      style={{
        background: "#0c1117",
        borderRadius: 16,
        padding: 20,
        color: "#fff",
      }}
    >
      <h3
        style={{
          margin: "0 0 4px 0",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: 14,
          color: "#888",
        }}
      >
        {subtitle}
      </p>

      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          style={{
            width: "100%",
            background: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: 10,
            padding: "12px 44px 12px 14px",
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: input.trim() ? "#3b82f6" : "#1a1a1a",
            color: input.trim() ? "#fff" : "#555",
            border: "none",
            borderRadius: 8,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          <ArrowUpRight size={16} />
        </button>
      </form>
    </div>
  )
}