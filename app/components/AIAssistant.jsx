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
        borderRadius: 16,
        padding: 20,
      }}
    >
      <h3
        style={{
          margin: "0 0 4px 0",
          fontSize: 18,
          fontWeight: 700,
        }}
        className="text-primary"
      >
        {title}
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: 14,
          color: "var(--text-muted)",
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
            background: "var(--bg-hover)",
            border: "1px solid var(--border-light)",
            borderRadius: 10,
            padding: "12px 44px 12px 14px",
            color: "var(--text-primary)",
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
            background: input.trim() ? "var(--accent-blue)" : "var(--bg-hover)",
            color: input.trim() ? "#fff" : "var(--text-muted)",
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