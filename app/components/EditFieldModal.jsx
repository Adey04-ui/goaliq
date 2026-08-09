"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function EditFieldModal({
  isOpen,
  onClose,
  label,
  fieldType = "text",
  currentValue,
  options = [],
  onSave,
}) {
  const [value, setValue] = useState(currentValue || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  // Capture last known props so the exit animation still has data
  // even after the parent sets modalConfig to null
  const [lastProps, setLastProps] = useState({
    label,
    fieldType,
    currentValue,
    options,
    onSave,
  })

  useEffect(() => {
    if (isOpen) {
      setLastProps({ label, fieldType, currentValue, options, onSave })
    }
  }, [isOpen, label, fieldType, currentValue, options, onSave])

  useEffect(() => {
    setValue(currentValue || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }, [currentValue, isOpen])

  const activeLabel = lastProps.label || label
  const activeFieldType = lastProps.fieldType || fieldType
  const activeOptions = lastProps.options || options

  async function handleSave() {
    setError("")
    const saveFn = lastProps.onSave || onSave

    if (activeFieldType === "password") {
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters")
        return
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match")
        return
      }
      setSaving(true)
      const result = await saveFn({ currentPassword, newPassword })
      setSaving(false)
      if (result?.success === false) {
        setError(result.message || "Something went wrong")
        return
      }
      onClose()
      return
    }

    setSaving(true)
    const result = await saveFn(value)
    setSaving(false)
    if (result?.success === false) {
      setError(result.message || "Something went wrong")
      return
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settingsModal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="settingsModal__panel"
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 40 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settingsModal__header">
              <h3>Edit {activeLabel}</h3>
              <button className="settingsModal__closeBtn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="settingsModal__body">
              {activeFieldType === "password" ? (
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
              ) : activeFieldType === "select" ? (
                <label className="settingsModal__label">
                  {activeLabel}
                  <select
                    className="settingsModal__input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                  >
                    {activeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="settingsModal__label">
                  {activeLabel}
                  <input
                    type={activeFieldType}
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
              <button
                className="settingsModal__saveBtn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}