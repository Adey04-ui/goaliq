"use client"

import { useUser } from "@/context/userContext"

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime())
}

export function useLocale() {
  const { preferences } = useUser()
  const lang = preferences?.language || "en"
  const localeMap = { en: "en-US", fr: "fr-FR", es: "es-ES" }
  return localeMap[lang] || "en-US"
}

export function useUserTimezone() {
  const { preferences } = useUser()
  return preferences?.timezone || undefined
}

export function useFormatMatchTime() {
  const locale = useLocale()
  const timeZone = useUserTimezone()
  return (dateString, options = {}) => {
    if (!dateString) return null
    const d = new Date(dateString)
    if (!isValidDate(d)) return null
    const opts = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleTimeString(locale, opts)
  }
}

export function useFormatDate() {
  const locale = useLocale()
  const timeZone = useUserTimezone()
  return (dateString, options = {}) => {
    if (!dateString) return null
    const d = new Date(dateString)
    if (!isValidDate(d)) return null
    const opts = { weekday: "short", month: "short", day: "numeric", timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleDateString(locale, opts)
  }
}

export function useFormatDateTime() {
  const locale = useLocale()
  const timeZone = useUserTimezone()
  return (dateString, options = {}) => {
    if (!dateString) return null
    const d = new Date(dateString)
    if (!isValidDate(d)) return null
    const opts = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleString(locale, opts)
  }
}