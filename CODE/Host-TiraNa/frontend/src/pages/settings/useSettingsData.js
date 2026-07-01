import { useEffect, useState, useCallback } from "react";

/**
 * Frontend-only mock for Account & Profile Management (host_flow.md §12.1–12.2).
 * No backend calls yet — reads/writes localStorage so edits persist across
 * refreshes the same way the rest of the dashboard mocks behave, and
 * simulates network latency so loading/saving states are real to build for.
 */

const PROFILE_KEY = "host_profile_settings";
const SESSIONS_KEY = "host_active_sessions";

function loadHost() {
  try {
    const raw = localStorage.getItem("host");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function defaultProfile() {
  const host = loadHost();
  return {
    avatar_url: host?.avatar_url || "",
    full_name: host?.full_name || "Maris Villanueva",
    email: host?.email || "maris.villanueva@tirana.host",
    phone: host?.phone || "+63 917 204 5582",
    bio: host?.bio ||
      "Hosting along the Tagaytay ridge since 2021. I keep two well-loved properties — quick to respond, quicker to recommend the nearest good lechon.",
    language: host?.language || "en",
    verification_status: host?.verification_status || "verified",
    member_since: host?.member_since || "2021-03-14",
  };
}

function defaultSessions() {
  return [
    {
      id: "sess_current",
      device: "Chrome on Windows",
      kind: "desktop",
      location: "Tagaytay, Cavite, PH",
      ip: "203.177.42.18",
      last_active: "now",
      current: true,
    },
    {
      id: "sess_2",
      device: "Safari on iPhone 14",
      kind: "mobile",
      location: "Quezon City, Metro Manila, PH",
      ip: "112.198.90.4",
      last_active: "2 hours ago",
      current: false,
    },
    {
      id: "sess_3",
      device: "Chrome on macOS",
      kind: "desktop",
      location: "Cebu City, Cebu, PH",
      ip: "120.28.71.150",
      last_active: "3 days ago",
      current: false,
    },
  ];
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function useSettingsData() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      await wait(450);
      if (!active) return;
      setProfile(readJSON(PROFILE_KEY, defaultProfile()));
      setSessions(readJSON(SESSIONS_KEY, defaultSessions()));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(async (next) => {
    setSavingProfile(true);
    await wait(700);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    const host = loadHost();
    if (host) {
      localStorage.setItem(
        "host",
        JSON.stringify({ ...host, full_name: next.full_name, avatar_url: next.avatar_url })
      );
    }
    setProfile(next);
    setSavingProfile(false);
    return true;
  }, []);

  const changePassword = useCallback(async () => {
    setChangingPassword(true);
    await wait(800);
    setChangingPassword(false);
    return true;
  }, []);

  const revokeSession = useCallback(
    async (id) => {
      setRevokingId(id);
      await wait(500);
      setSessions((list) => {
        const next = list.filter((s) => s.id !== id);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
      setRevokingId(null);
    },
    []
  );

  return {
    profile,
    sessions,
    loading,
    savingProfile,
    changingPassword,
    revokingId,
    saveProfile,
    changePassword,
    revokeSession,
  };
}