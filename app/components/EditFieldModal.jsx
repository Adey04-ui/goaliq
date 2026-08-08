"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

// Generic single-field edit modal — reused for every clickable settings row.
// fieldType: "text" | "email" | "select" | "password"
export default function EditFieldModal({
  isOpen,
  onClose,
  label,
  fieldType = "text",
  currentValue,
  options = [], // for fieldType "select" — [{ label, value }]
  onSave,
}) {
  const [value, setValue] = useState(currentValue || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  // reset local state whenever a different field is opened
  useEffect(() =>  {
    setValue(currentValue || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }, [currentValue, isOpen])

  if (!isOpen) return null

  async function handleSave() {
    setError("")

    if (fieldType === "password") {
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters")
        return
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match")
        return
      }
      setSaving(true)
      const result = await onSave({ currentPassword, newPassword })
      setSaving(false)
      if (result?.success === false) {
        setError(result.message || "Something went wrong")
        return
      }
      onClose()
      return
    }

    setSaving(true)
    const result = await onSave(value)
    setSaving(false)
    if (result?.success === false) {
      setError(result.message || "Something went wrong")
      return
    }
    onClose()
  }

  return (
    <div className="settingsModal__overlay" onClick={onClose}>
      <div className="settingsModal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="settingsModal__header">
          <h3>Edit {label}</h3>
          <button className="settingsModal__closeBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settingsModal__body">
          {fieldType === "password" ? (
            <>
              <label className="settingsModal__label">
                Current Password
                <input
                  type="password"
                  className="settingsModal__input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="settingsModal__label">
                New Password
                <input
                  type="password"
                  className="settingsModal__input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label className="settingsModal__label">
                Confirm New Password
                <input
                  type="password"
                  className="settingsModal__input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            </>
          ) : fieldType === "select" ? (
            <label className="settingsModal__label">
              {label}
              <select
                className="settingsModal__input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="settingsModal__label">
              {label}
              <input
                type={fieldType}
                className="settingsModal__input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </label>
          )}

          {error && <div className="settingsModal__error">{error}</div>}
        </div>

        <div className="settingsModal__footer">
          <button className="settingsModal__cancelBtn" onClick={onClose}>
            Cancel
          </button>
          <button className="settingsModal__saveBtn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}