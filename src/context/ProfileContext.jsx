// src/context/ProfileContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "Roberto",
    accountNumber: "77990250980",
    email: "roberto@email.com",
    phone: "+1 (555) 123-4567",
    avatarUrl: null,
  });

  const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:3001";

  // Try to load authoritative profile from server first, fallback to localStorage
  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) Try server (/api/me returns user profile when authenticated)
      try {
        const r = await fetch(`${BACKEND}/api/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (r.ok) {
          const data = await r.json();
          if (mounted && data) {
            const merged = (prev => ({ ...prev, ...data }))(profile);
            setProfile(merged);
            try { localStorage.setItem("boldbank_profile", JSON.stringify(merged)); } catch (e) {}
            return;
          }
        }
      } catch (err) {
        // ignore server load error; we'll try localStorage
      }

      // 2) fallback: load from localStorage
      try {
        const raw = localStorage.getItem("boldbank_profile");
        if (raw && mounted) setProfile(JSON.parse(raw));
      } catch (e) {
        /* ignore */
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Keep localStorage in sync for quick reloads (and offline)
  useEffect(() => {
    try {
      localStorage.setItem("boldbank_profile", JSON.stringify(profile));
    } catch (e) {
      /* ignore */
    }
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
