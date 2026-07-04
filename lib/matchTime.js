export function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatMatchTime(dateString) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: getUserTimeZone(),
  })
}

export function formatTimezoneAbbreviation() {
  return new Date()
    .toLocaleString("en-US", { timeZoneName: "short" })
    .split(" ")
    .pop()
    .replace("UTC", "GMT")
}

export function formatLocalDateLabel(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: getUserTimeZone(),
  })
}
