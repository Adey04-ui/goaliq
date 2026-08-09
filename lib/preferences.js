"use client"

import { useUser } from "@/context/userContext"

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
    const d = new Date(dateString)
    const opts = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleTimeString(locale, opts)
  }
}

export function useFormatDate() {
  const locale = useLocale()
  const timeZone = useUserTimezone()
  return (dateString, options = {}) => {
    const d = new Date(dateString)
    const opts = { weekday: "short", month: "short", day: "numeric", timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleDateString(locale, opts)
  }
}

export function useFormatDateTime() {
  const locale = useLocale()
  const timeZone = useUserTimezone()
  return (dateString, options = {}) => {
    const d = new Date(dateString)
    const opts = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone, ...options }
    if (!timeZone) delete opts.timeZone
    return d.toLocaleString(locale, opts)
  }
}