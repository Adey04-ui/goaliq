"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useUser } from "@/context/userContext" // adjust path/shape if your real context differs
import EditFieldModal from "./EditFieldModal"

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

function AccountSection({ user, updateUser, openModal }) {
  return (
    <>
      <div className="settingsCard">
        <div className="settingsCard__header">
          <h2>Account Information</h2>
          <p>Update your account details and manage your profile.</p>
        </div>

        <div className="settingsCard__profileRow">
          <div className="settingsCard__avatarWrapper">
            <Image src={user.avatar} alt={user.displayName} width={56} height={56} className="settingsCard__avatar" />
            <label className="settingsCard__avatarEditBtn">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateUser({ avatarFile: file })
                }}
              />
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
          label="Password"
          value="••••••••"
          onClick={() =>
            openModal({
              label: "Password",
              fieldType: "password",
              onSave: (payload) => updateUser({ passwordChange: payload }),
            })
          }
        />
        <SettingsRow
          label="Country / Region"
          value={COUNTRY_OPTIONS.find((c) => c.value === user.country)?.label || user.country}
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
          value={TIMEZONE_OPTIONS.find((t) => t.value === user.timezone)?.label || user.timezone}
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
    </>
  )
}

function PlaceholderSection({ label }) {
  return (
    <div className="settingsCard">
      <div className="settingsCard__header">
        <h2>{label}</h2>
        <p>This section isn&apos;t built yet.</p>
      </div>
    </div>
  )
}

export default function Settings() {
  const { status: user, updateUser } = useUser() // adjust to your real context's shape
  const [activeTab, setActiveTab] = useState("account")
  const [modalConfig, setModalConfig] = useState(null)
  const { session, status } = useUser()

  function openModal(config) {
    setModalConfig(config)
  }

  function closeModal() {
    setModalConfig(null)
  }

  if (user == "loading") return <div className="settingsMiddle__loading">Loading settings...</div>

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
          {activeTab === "account" ? (
            <AccountSection user={user} updateUser={updateUser} openModal={openModal} />
          ) : (
            <PlaceholderSection label={NAV_ITEMS.find((n) => n.key === activeTab)?.label} />
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