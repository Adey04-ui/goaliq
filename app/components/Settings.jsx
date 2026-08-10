"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Palette,
  ShieldCheck,
  UserX,
  CreditCard,
  Info,
  ChevronRight,
  Camera,
  LogIn,
} from "lucide-react"
import { useUser } from "@/context/userContext"
import EditFieldModal from "./EditFieldModal"
import { useSignIn } from "@/context/signInContext"

const NAV_ITEMS = [
  { key: "account", label: "Account", icon: User },
  { key: "preferences", label: "Preferences", icon: SettingsIcon },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "privacy", label: "Data & Privacy", icon: ShieldCheck },
  { key: "blocked", label: "Blocked Users", icon: UserX },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "about", label: "About", icon: Info },
]

const TIMEZONE_OPTIONS = [
  { label: "(GMT+01:00) West Africa Time", value: "Africa/Lagos" },
  { label: "(GMT+00:00) London", value: "Europe/London" },
  { label: "(GMT-05:00) New York", value: "America/New_York" },
  { label: "(GMT+01:00) Berlin", value: "Europe/Berlin" },
]

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
]

const COUNTRY_OPTIONS = [
  { label: "Nigeria", value: "NG" },
  { label: "United Kingdom", value: "GB" },
  { label: "United States", value: "US" },
  { label: "Ghana", value: "GH" },
]

const MATCH_VIEW_OPTIONS = [
  { label: "Live", value: "live" },
  { label: "Fixtures", value: "fixtures" },
  { label: "Results", value: "results" },
]

/* ───────── Skeleton ───────── */
function SkeletonPulse({ width, height, radius = 6, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "settingsSkeletonShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function SettingsSkeleton() {
  return (
    <div className="settingsMiddle">
      <style>{`
        @keyframes settingsSkeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div className="settingsMiddle__header">
        <SkeletonPulse width={140} height={28} style={{ marginBottom: 8 }} />
        <SkeletonPulse width={260} height={16} />
      </div>

      <div className="settingsMiddle__body" style={{ width: '100%' }}>
        {/* Nav */}
        <div className="settingsNav">
          {NAV_ITEMS.map((_, i) => (
            <div key={i} className="settingsNav__item" style={{ opacity: 0.4 }}>
              <SkeletonPulse width={16} height={16} radius={4} style={{ marginRight: 8, flexShrink: 0 }} />
              <SkeletonPulse width={80} height={14} />
            </div>
          ))}
        </div>

        {/* Content card */}
        <div className="settingsContent">
          <div className="settingsCard">
            <div className="settingsCard__header" style={{ marginBottom: 20 }}>
              <SkeletonPulse width={160} height={22} style={{ marginBottom: 6 }} />
              <SkeletonPulse width={240} height={14} />
            </div>

            {/* Profile row skeleton */}
            <div className="settingsCard__profileRow" style={{ marginBottom: 16 }}>
              <SkeletonPulse width={56} height={56} radius="50%" style={{ marginRight: 16 }} />
              <div style={{ flex: 1 }}>
                <SkeletonPulse width={120} height={16} style={{ marginBottom: 8 }} />
                <SkeletonPulse width={180} height={12} />
              </div>
              <SkeletonPulse width={80} height={32} radius={8} />
            </div>

            {/* Rows skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="settingsRow"
                style={{
                  borderBottom: "1px solid #1a1a1a",
                  padding: "14px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SkeletonPulse width={100} height={14} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SkeletonPulse width={60} height={14} />
                  <SkeletonPulse width={16} height={16} radius={4} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── Not Authenticated ───────── */
function NotAuthenticated() {
  const { showSignIn, setShowSignIn } = useSignIn()
  return (
    <div
      className="settingsMiddle"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 360,
          padding: "40px 24px",
          background: "#111",
          borderRadius: 16,
          border: "1px solid #222",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <LogIn size={28} color="#888" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
          Sign in required
        </h2>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.5, margin: "0 0 24px" }}>
          Please sign in to manage your account settings and preferences.
        </p>
        <button
          onClick={() => setShowSignIn(true)}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LogIn size={16} />
          Sign In
        </button>
      </div>
    </div>
  )
}

/* ───────── UI Components ───────── */
function SettingsRow({ label, value, onClick }) {
  return (
    <div className="settingsRow" onClick={onClick}>
      <span className="settingsRow__label">{label}</span>
      <div className="settingsRow__valueGroup">
        <span className="settingsRow__value">{value}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="settingsRow settingsRow--toggle">
      <div>
        <span className="settingsRow__label">{label}</span>
        {description && <div className="settingsRow__description">{description}</div>}
      </div>
      <button
        className={`settingsToggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="settingsToggle__knob" />
      </button>
    </div>
  )
}

/* ───────── Main Component ───────── */
export default function Settings() {
  const { status } = useUser()
  const [activeTab, setActiveTab] = useState("account")
  const [modalConfig, setModalConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Raw API data
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [activities, setActivities] = useState([])
  const [blockedList, setBlockedList] = useState([])

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setProfile(data.user)
      } else {
        alert(data.message || "Upload failed")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong uploading the image")
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const user = profile
    ? {
      displayName: profile.name || "",
      email: profile.email || "",
      avatar: profile.image || "/default-avatar.png",
      isPremium: subscription?.plan === "pro",
      country: profile.country || "",
      language: profile.language || "en",
      timezone: profile.timezone || "",
      defaultMatchView: profile.defaultMatchView || "live",
      dataSaver: profile.dataSaver || false,
      autoPlayVideos: profile.autoPlayVideos ?? true,
      showPlayerRatings: profile.showPlayerRatings ?? true,
      theme: profile.theme || "dark",
      matchReminders: profile.matchReminders ?? true,
      goalAlerts: profile.goalAlerts ?? true,
      redCardAlerts: profile.redCardAlerts ?? true,
      halfTimeScores: profile.halfTimeScores ?? false,
      fullTimeScores: profile.fullTimeScores ?? true,
      newsAlerts: profile.newsAlerts ?? true,
      transferAlerts: profile.transferAlerts ?? false,
      pushEnabled: profile.pushEnabled ?? true,
      emailEnabled: profile.emailEnabled ?? false,
      quietHoursEnabled: profile.quietHoursEnabled ?? false,
    }
    : null

  const loadData = useCallback(async () => {
    try {
      const [pRes, sRes, aRes, bRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/subscription"),
        fetch("/api/user/activity"),
        fetch("/api/user/blocked"),
      ])
      const pData = await pRes.json()
      const sData = await sRes.json()
      const aData = await aRes.json()
      const bData = await bRes.json()

      if (pData.success) setProfile(pData.user)
      if (sData.success) setSubscription(sData.subscription)
      if (aData.success) setActivities(aData.activities)
      if (bData.success) setBlockedList(bData.blocked)
    } catch (e) {
      console.error("Failed to load settings:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") loadData()
  }, [status, loadData])

  async function updateUser(updates) {
    const payload = {}
    if (updates.displayName !== undefined) payload.name = updates.displayName
    if (updates.country !== undefined) payload.country = updates.country
    if (updates.language !== undefined) payload.language = updates.language
    if (updates.timezone !== undefined) payload.timezone = updates.timezone
    if (updates.defaultMatchView !== undefined) payload.defaultMatchView = updates.defaultMatchView
    if (updates.dataSaver !== undefined) payload.dataSaver = updates.dataSaver
    if (updates.autoPlayVideos !== undefined) payload.autoPlayVideos = updates.autoPlayVideos
    if (updates.showPlayerRatings !== undefined) payload.showPlayerRatings = updates.showPlayerRatings
    if (updates.theme !== undefined) payload.theme = updates.theme
    if (updates.matchReminders !== undefined) payload.matchReminders = updates.matchReminders
    if (updates.goalAlerts !== undefined) payload.goalAlerts = updates.goalAlerts
    if (updates.redCardAlerts !== undefined) payload.redCardAlerts = updates.redCardAlerts
    if (updates.halfTimeScores !== undefined) payload.halfTimeScores = updates.halfTimeScores
    if (updates.fullTimeScores !== undefined) payload.fullTimeScores = updates.fullTimeScores
    if (updates.newsAlerts !== undefined) payload.newsAlerts = updates.newsAlerts
    if (updates.transferAlerts !== undefined) payload.transferAlerts = updates.transferAlerts
    if (updates.pushEnabled !== undefined) payload.pushEnabled = updates.pushEnabled
    if (updates.emailEnabled !== undefined) payload.emailEnabled = updates.emailEnabled
    if (updates.quietHoursEnabled !== undefined) payload.quietHoursEnabled = updates.quietHoursEnabled

    setProfile((prev) => (prev ? { ...prev, ...payload } : prev))

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.user)
      } else {
        console.error(data.message)
      }
    } catch (e) {
      console.error("Update failed:", e)
    }
  }

  async function unblockUser(blockedId) {
    try {
      const res = await fetch(`/api/user/blocked?id=${blockedId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setBlockedList((prev) => prev.filter((b) => b.blocked.id !== blockedId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  function openModal(config) {
    setModalConfig(config)
  }

  function closeModal() {
    setModalConfig(null)
  }

  /* ───────── Guards ───────── */
  if (status === "unauthenticated") {
    return <NotAuthenticated />
  }

  if (status === "loading" || loading) {
    return <SettingsSkeleton />
  }

  if (!user) return null

  return (
    <div className="settingsMiddle">
      <div className="settingsMiddle__header">
        <h1>Settings</h1>
        <p>Manage your preferences and account settings.</p>
      </div>

      <div className="settingsMiddle__body">
        <div className="settingsNav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`settingsNav__item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="settingsContent">
          {activeTab === "account" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>Account Information</h2>
                <p>Update your account details and manage your profile.</p>
              </div>

              <div className="settingsCard__profileRow">
                <div className="settingsCard__avatarWrapper">
                  <Image
                    src={user.avatar}
                    alt={user.displayName}
                    width={56}
                    height={56}
                    className="settingsCard__avatar"
                  />
                  {uploadingAvatar && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 12, color: "#888" }}>Uploading...</span>
                    </div>
                  )}
                  <label className="settingsCard__avatarEditBtn">
                    <Camera size={14} />
                    <input type="file" accept="image/*" hidden onChange={handleAvatarChange} disabled={uploadingAvatar} />
                  </label>
                </div>
                <div className="settingsCard__profileInfo">
                  <span className="settingsCard__profileName">{user.displayName}</span>
                  <span className="settingsCard__profileEmail">{user.email}</span>
                  {user.isPremium && <span className="settingsCard__premiumBadge">Premium</span>}
                </div>
                <button className="settingsCard__editProfileBtn">Edit Profile</button>
              </div>

              <SettingsRow
                label="Display Name"
                value={user.displayName}
                onClick={() =>
                  openModal({
                    label: "Display Name",
                    fieldType: "text",
                    currentValue: user.displayName,
                    onSave: (val) => updateUser({ displayName: val }),
                  })
                }
              />
              <SettingsRow
                label="Email Address"
                value={user.email}
                onClick={() =>
                  openModal({
                    label: "Email Address",
                    fieldType: "email",
                    currentValue: user.email,
                    onSave: (val) => updateUser({ email: val }),
                  })
                }
              />
              <SettingsRow
                label="Country / Region"
                value={COUNTRY_OPTIONS.find((c) => c.value === user.country)?.label || user.country || "Not set"}
                onClick={() =>
                  openModal({
                    label: "Country / Region",
                    fieldType: "select",
                    options: COUNTRY_OPTIONS,
                    currentValue: user.country,
                    onSave: (val) => updateUser({ country: val }),
                  })
                }
              />
              <SettingsRow
                label="Language"
                value={LANGUAGE_OPTIONS.find((l) => l.value === user.language)?.label || user.language}
                onClick={() =>
                  openModal({
                    label: "Language",
                    fieldType: "select",
                    options: LANGUAGE_OPTIONS,
                    currentValue: user.language,
                    onSave: (val) => updateUser({ language: val }),
                  })
                }
              />
              <SettingsRow
                label="Time Zone"
                value={TIMEZONE_OPTIONS.find((t) => t.value === user.timezone)?.label || user.timezone || "Not set"}
                onClick={() =>
                  openModal({
                    label: "Time Zone",
                    fieldType: "select",
                    options: TIMEZONE_OPTIONS,
                    currentValue: user.timezone,
                    onSave: (val) => updateUser({ timezone: val }),
                  })
                }
              />
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>App Preferences</h2>
                <p>Customize your GOALIQ experience.</p>
              </div>

              <SettingsRow
                label="Default Match View"
                value={MATCH_VIEW_OPTIONS.find((m) => m.value === user.defaultMatchView)?.label || "Live"}
                onClick={() =>
                  openModal({
                    label: "Default Match View",
                    fieldType: "select",
                    options: MATCH_VIEW_OPTIONS,
                    currentValue: user.defaultMatchView,
                    onSave: (val) => updateUser({ defaultMatchView: val }),
                  })
                }
              />
              <ToggleRow
                label="Data Saver"
                description="Reduce data usage for images and videos"
                checked={user.dataSaver}
                onChange={(val) => updateUser({ dataSaver: val })}
              />
              <ToggleRow
                label="Auto-Play Videos"
                description="Play match highlights automatically"
                checked={user.autoPlayVideos}
                onChange={(val) => updateUser({ autoPlayVideos: val })}
              />
              <ToggleRow
                label="Show Player Ratings"
                description="Display player ratings in match views"
                checked={user.showPlayerRatings}
                onChange={(val) => updateUser({ showPlayerRatings: val })}
              />
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>Appearance</h2>
                <p>Choose your preferred theme.</p>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <button
                  className={`settingsCard ${user.theme === "dark" ? "active" : ""}`}
                  style={{ flex: 1, padding: 20, border: user.theme === "dark" ? "2px solid #3b82f6" : "1px solid #333" }}
                  onClick={() => updateUser({ theme: "dark" })}
                >
                  <div style={{ width: "100%", height: 60, background: "#0a0a0a", borderRadius: 8, marginBottom: 8, border: "1px solid #333" }} />
                  <span>Dark</span>
                </button>
                <button
                  className={`settingsCard ${user.theme === "light" ? "active" : ""}`}
                  style={{ flex: 1, padding: 20, border: user.theme === "light" ? "2px solid #3b82f6" : "1px solid #333" }}
                  onClick={() => updateUser({ theme: "light" })}
                >
                  <div style={{ width: "100%", height: 60, background: "#f5f5f5", borderRadius: 8, marginBottom: 8, border: "1px solid #ddd" }} />
                  <span>Light</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <>
              <div className="settingsCard">
                <div className="settingsCard__header">
                  <h2>Login Activity</h2>
                  <p>Recent devices that have signed into your account.</p>
                </div>

                {activities.length === 0 ? (
                  <p style={{ color: "#888", padding: "12px 0" }}>No recent login activity.</p>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="settingsRow">
                      <div>
                        <span className="settingsRow__label">{a.device || "Unknown device"}</span>
                        <div className="settingsRow__description">
                          {a.ipAddress || "Unknown IP"}
                          {a.location && ` · ${a.location}`}
                          {" · "}{new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>Current</span>
                    </div>
                  ))
                )}
              </div>

              <div className="settingsCard" style={{ marginTop: 16, borderColor: "#ff4444" }}>
                <div className="settingsCard__header">
                  <h2 style={{ color: "#ff4444" }}>Danger Zone</h2>
                </div>
                <button
                  className="settingsCard__editProfileBtn"
                  style={{ background: "transparent", border: "1px solid #ff4444", color: "#ff4444" }}
                  onClick={() => {
                    if (confirm("Delete your account permanently? This cannot be undone.")) {
                      alert("Account deletion not yet implemented.")
                    }
                  }}
                >
                  Delete Account
                </button>
              </div>
            </>
          )}

          {activeTab === "blocked" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>Blocked Users</h2>
                <p>Users you've blocked from interacting with you.</p>
              </div>

              {blockedList.length === 0 ? (
                <p style={{ color: "#888", padding: "12px 0" }}>You haven't blocked anyone yet.</p>
              ) : (
                blockedList.map((b) => (
                  <div key={b.id} className="settingsRow" style={{ gap: 12 }}>
                    <Image
                      src={b.blocked.image || "/default-avatar.png"}
                      alt={b.blocked.name}
                      width={40}
                      height={40}
                      style={{ borderRadius: "50%" }}
                    />
                    <div style={{ flex: 1 }}>
                      <span className="settingsRow__label">{b.blocked.name || "Unknown"}</span>
                      <div className="settingsRow__description">{b.blocked.email}</div>
                    </div>
                    <button
                      className="settingsCard__editProfileBtn"
                      style={{ padding: "4px 12px", fontSize: 13 }}
                      onClick={() => unblockUser(b.blocked.id)}
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>Subscription</h2>
                <p>Manage your plan and billing.</p>
              </div>

              <div
                className="settingsRow"
                style={{
                  background: "#0a0a0a",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <span className="settingsRow__label" style={{ fontSize: 18 }}>
                  {subscription?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                </span>
                <span style={{ color: "#888", fontSize: 14, textTransform: "capitalize" }}>
                  {subscription?.status || "active"}
                </span>
                {subscription?.plan === "free" && (
                  <button
                    className="settingsCard__editProfileBtn"
                    style={{ marginTop: 8 }}
                    onClick={() => alert("Stripe integration coming soon")}
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>

              {subscription?.currentPeriodEnd && (
                <div className="settingsRow">
                  <span className="settingsRow__label">Current period ends</span>
                  <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>Notifications</h2>
                <p>Choose what you want to be notified about.</p>
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px" }}>
                Match Alerts
              </h3>
              <ToggleRow
                label="Match Reminders"
                description="30 minutes before kickoff for favorite teams"
                checked={user.matchReminders}
                onChange={(val) => updateUser({ matchReminders: val })}
              />
              <ToggleRow
                label="Goal Alerts"
                description="Instant alert when a goal is scored in a followed match"
                checked={user.goalAlerts}
                onChange={(val) => updateUser({ goalAlerts: val })}
              />
              <ToggleRow
                label="Red Cards"
                description="Alert on red card incidents"
                checked={user.redCardAlerts}
                onChange={(val) => updateUser({ redCardAlerts: val })}
              />
              <ToggleRow
                label="Half-Time Scores"
                description="Receive score update at half-time"
                checked={user.halfTimeScores}
                onChange={(val) => updateUser({ halfTimeScores: val })}
              />
              <ToggleRow
                label="Full-Time Results"
                description="Final whistle score for followed matches"
                checked={user.fullTimeScores}
                onChange={(val) => updateUser({ fullTimeScores: val })}
              />

              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px" }}>
                Updates
              </h3>
              <ToggleRow
                label="News Alerts"
                description="Breaking football news and headlines"
                checked={user.newsAlerts}
                onChange={(val) => updateUser({ newsAlerts: val })}
              />
              <ToggleRow
                label="Transfer Rumors"
                description="Major transfer updates and confirmed deals"
                checked={user.transferAlerts}
                onChange={(val) => updateUser({ transferAlerts: val })}
              />

              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px" }}>
                Delivery
              </h3>
              <ToggleRow
                label="Push Notifications"
                description="In-app and device push (requires permission)"
                checked={user.pushEnabled}
                onChange={(val) => updateUser({ pushEnabled: val })}
              />
              <ToggleRow
                label="Email Digest"
                description="Weekly summary of your favorite teams"
                checked={user.emailEnabled}
                onChange={(val) => updateUser({ emailEnabled: val })}
              />
              <ToggleRow
                label="Quiet Hours"
                description="Pause all alerts from 11PM — 7AM"
                checked={user.quietHoursEnabled}
                onChange={(val) => updateUser({ quietHoursEnabled: val })}
              />
            </div>
          )}

          {activeTab === "about" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2>About GOALIQ</h2>
              </div>

              <div className="settingsRow" style={{ cursor: "default" }}>
                <span className="settingsRow__label">Version</span>
                <span style={{ color: "#888", fontSize: 14 }}>1.0.0</span>
              </div>
              <div className="settingsRow" style={{ cursor: "default" }}>
                <span className="settingsRow__label">Build</span>
                <span style={{ color: "#888", fontSize: 14 }}>2026.08.09</span>
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px" }}>
                Legal
              </h3>
              <SettingsRow label="Terms of Service" value="" onClick={() => alert("Terms page coming soon")} />
              <SettingsRow label="Privacy Policy" value="" onClick={() => alert("Privacy page coming soon")} />

              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px" }}>
                Support
              </h3>
              <SettingsRow label="Contact Support" value="" onClick={() => window.location.href = "mailto:support@goaliq.com"} />
              <SettingsRow label="Report a Bug" value="" onClick={() => window.location.href = "mailto:bugs@goaliq.com"} />
            </div>
          )}
        </div>
      </div>

      <EditFieldModal
        isOpen={!!modalConfig}
        onClose={closeModal}
        label={modalConfig?.label}
        fieldType={modalConfig?.fieldType}
        currentValue={modalConfig?.currentValue}
        options={modalConfig?.options || []}
        onSave={modalConfig?.onSave}
      />
    </div>
  )
}