"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
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
import { useTheme } from "@/context/themeContext"
import { useToast } from "@/lib/useToast"
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
function SkeletonPulse({ width, height, radius = 6 }) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width, height, borderRadius: radius }}
    />
  )
}

function SettingsSkeleton() {
  return (
    <div className="settingsMiddle settingsMiddle--skeleton">
      <div className="settingsMiddle__header">
        <SkeletonPulse width={140} height={28} />
        <SkeletonPulse width={260} height={16} />
      </div>

      <div className="settingsMiddle__body">
        <div className="settingsNav settingsNav--skeleton">
          {NAV_ITEMS.map((_, i) => (
            <div key={i} className="settingsNav__item settingsNav__item--skeleton">
              <SkeletonPulse width={16} height={16} radius={4} />
              <SkeletonPulse width={80} height={14} />
            </div>
          ))}
        </div>

        <div className="settingsContent">
          <div className="settingsCard settingsCard--skeleton">
            <div className="settingsCard__header settingsCard__header--skeleton">
              <SkeletonPulse width={160} height={22} />
              <SkeletonPulse width={240} height={14} />
            </div>

            <div className="settingsCard__profileRow settingsCard__profileRow--skeleton">
              <SkeletonPulse width={56} height={56} radius="50%" />
              <div className="settingsCard__profileText">
                <SkeletonPulse width={120} height={16} />
                <SkeletonPulse width={180} height={12} />
              </div>
              <SkeletonPulse width={80} height={32} radius={8} />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="settingsRow settingsRow--skeleton">
                <SkeletonPulse width={100} height={14} />
                <div className="settingsRow__right">
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
  const { setShowSignIn } = useSignIn()
  return (
    <div className="settingsMiddle settingsMiddle--empty">
      <div className="settingsEmpty">
        <div className="settingsEmpty__icon">
          <LogIn size={28} />
        </div>
        <h2 className="settingsEmpty__title">Sign in required</h2>
        <p className="settingsEmpty__text">
          Please sign in to manage your account settings and preferences.
        </p>
        <button className="settingsEmpty__btn" onClick={() => setShowSignIn(true)}>
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
    <div className="settingsRow" onClick={onClick} role="button" tabIndex={0}>
      <span className="settingsRow__label">{label}</span>
      <div className="settingsRow__valueGroup">
        <span className="settingsRow__value">{value}</span>
        <ChevronRight size={16} className="settingsRow__chevron" />
      </div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="settingsRow settingsRow--toggle">
      <div className="settingsRow__text">
        <span className="settingsRow__label">{label}</span>
        {description && <div className="settingsRow__description">{description}</div>}
      </div>
      <button
        className={`settingsToggle ${checked ? "settingsToggle--on" : ""}`}
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
  const { theme, setTheme } = useTheme()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState("account")
  const [modalConfig, setModalConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
        success("Avatar updated", "Your profile picture has been changed.")
      } else {
        error("Upload failed", data.message || "Could not upload image.")
      }
    } catch (err) {
      console.error(err)
      error("Upload failed", "Something went wrong uploading the image.")
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
      error("Failed to load", "Could not fetch your settings. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [error])

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
        success("Saved", "Your preference has been updated.")
      } else {
        console.error(data.message)
        error("Update failed", data.message || "Could not save changes.")
      }
    } catch (e) {
      console.error("Update failed:", e)
      error("Update failed", "Something went wrong. Please try again.")
    }
  }

  async function unblockUser(blockedId) {
    try {
      const res = await fetch(`/api/user/blocked?id=${blockedId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setBlockedList((prev) => prev.filter((b) => b.blocked.id !== blockedId))
        success("User unblocked", "They can now interact with you again.")
      } else {
        error("Unblock failed", data.message || "Could not unblock user.")
      }
    } catch (e) {
      console.error(e)
      error("Unblock failed", "Something went wrong.")
    }
  }

  async function signOutDevice(activityId) {
    try {
      const res = await fetch(`/api/user/activity?id=${activityId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setActivities((prev) => prev.filter((a) => a.id !== activityId))
        success("Signed out", "That device has been signed out.")
      } else {
        error("Failed", data.message || "Could not sign out that device.")
      }
    } catch (e) {
      console.error(e)
      error("Failed", "Something went wrong.")
    }
  }

  function openModal(config) {
    setModalConfig(config)
  }

  function closeModal() {
    setModalConfig(null)
  }

  if (status === "unauthenticated") return <NotAuthenticated />
  if (status === "loading" || loading) return <SettingsSkeleton />
  if (!user) return null

  return (
    <div className="settingsMiddle">
      <div className="settingsMiddle__header">
        <h1 className="settingsMiddle__title">Settings</h1>
        <p className="settingsMiddle__subtitle">Manage your preferences and account settings.</p>
      </div>

      <div className="settingsMiddle__body">
        <div className="settingsNav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`settingsNav__item ${activeTab === key ? "settingsNav__item--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="settingsContent">
          {activeTab === "account" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2 className="settingsCard__title">Account Information</h2>
                <p className="settingsCard__subtitle">Update your account details and manage your profile.</p>
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
                    <div className="settingsCard__avatarOverlay">
                      <span>Uploading...</span>
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
                <h2 className="settingsCard__title">App Preferences</h2>
                <p className="settingsCard__subtitle">Customize your GOALIQ experience.</p>
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
                <h2 className="settingsCard__title">Appearance</h2>
                <p className="settingsCard__subtitle">Choose your preferred theme.</p>
              </div>

              <div className="themeSelector">
                <button
                  className={`themeSelector__card ${theme === "dark" ? "themeSelector__card--active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="themeSelector__preview themeSelector__preview--dark" />
                  <span className="themeSelector__label">Dark</span>
                </button>
                <button
                  className={`themeSelector__card ${theme === "light" ? "themeSelector__card--active" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="themeSelector__preview themeSelector__preview--light" />
                  <span className="themeSelector__label">Light</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <>
              <div className="settingsCard">
                <div className="settingsCard__header">
                  <h2 className="settingsCard__title">Login Activity</h2>
                  <p className="settingsCard__subtitle">Recent devices that have signed into your account.</p>
                </div>

                {activities.length === 0 ? (
                  <p className="settingsCard__empty">No recent login activity.</p>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="settingsRow">
                      <div className="settingsRow__text">
                        <span className="settingsRow__label">{a.device || "Unknown device"}</span>
                        <div className="settingsRow__description">
                          {a.ipAddress || "Unknown IP"}
                          {a.location && ` · ${a.location}`}
                          {" · "}{new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {a.isCurrent ? (
                        <span className="settingsRow__status settingsRow__status--current">Current</span>
                      ) : (
                        <button
                          className="settingsCard__editProfileBtn settingsCard__editProfileBtn--sm"
                          onClick={() => signOutDevice(a.id)}
                        >
                          Sign out
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="settingsCard settingsCard--danger">
                <div className="settingsCard__header">
                  <h2 className="settingsCard__title settingsCard__title--danger">Danger Zone</h2>
                </div>
                <button
                  className="settingsCard__dangerBtn"
                  onClick={() => {
                    if (confirm("Delete your account permanently? This cannot be undone.")) {
                      error("Not available", "Account deletion is not yet implemented.")
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
                <h2 className="settingsCard__title">Blocked Users</h2>
                <p className="settingsCard__subtitle">Users you&apos;ve blocked from interacting with you.</p>
              </div>

              {blockedList.length === 0 ? (
                <p className="settingsCard__empty">You haven&apos;t blocked anyone yet.</p>
              ) : (
                blockedList.map((b) => (
                  <div key={b.id} className="settingsRow settingsRow--blocked">
                    <Image
                      src={b.blocked.image || "/default-avatar.png"}
                      alt={b.blocked.name}
                      width={40}
                      height={40}
                      className="settingsRow__avatar"
                    />
                    <div className="settingsRow__text settingsRow__text--grow">
                      <span className="settingsRow__label">{b.blocked.name || "Unknown"}</span>
                      <div className="settingsRow__description">{b.blocked.email}</div>
                    </div>
                    <button className="settingsCard__editProfileBtn settingsCard__editProfileBtn--sm" onClick={() => unblockUser(b.blocked.id)}>
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
                <h2 className="settingsCard__title">Subscription</h2>
                <p className="settingsCard__subtitle">Manage your plan and billing.</p>
              </div>

              <div className="settingsCard__planCard">
                <span className="settingsCard__planName">
                  {subscription?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                </span>
                <span className="settingsCard__planStatus">
                  {subscription?.status || "active"}
                </span>
                {subscription?.plan === "free" && (
                  <button
                    className="settingsCard__editProfileBtn"
                    onClick={() => error("Coming soon", "Stripe integration is not ready yet.")}
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>

              {subscription?.currentPeriodEnd && (
                <div className="settingsRow">
                  <span className="settingsRow__label">Current period ends</span>
                  <span className="settingsRow__value">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settingsCard">
              <div className="settingsCard__header">
                <h2 className="settingsCard__title">Notifications</h2>
                <p className="settingsCard__subtitle">Choose what you want to be notified about.</p>
              </div>

              <h3 className="settingsSectionTitle">Match Alerts</h3>
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

              <h3 className="settingsSectionTitle">Updates</h3>
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

              <h3 className="settingsSectionTitle">Delivery</h3>
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
                <h2 className="settingsCard__title">About GOALIQ</h2>
              </div>

              <div className="settingsRow settingsRow--static">
                <span className="settingsRow__label">Version</span>
                <span className="settingsRow__value settingsRow__value--muted">1.0.0</span>
              </div>
              <div className="settingsRow settingsRow--static">
                <span className="settingsRow__label">Build</span>
                <span className="settingsRow__value settingsRow__value--muted">2026.08.09</span>
              </div>

              <h3 className="settingsSectionTitle">Legal</h3>
              <SettingsRow label="Terms of Service" value="" onClick={() => error("Coming soon", "Terms page is under construction.")} />
              <SettingsRow label="Privacy Policy" value="" onClick={() => error("Coming soon", "Privacy page is under construction.")} />

              <h3 className="settingsSectionTitle">Support</h3>
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