// src/context/ProfileContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "Roberto",
    accountNumber: "77990250980",
    email: "roberto@email.com",
    phone: "+1 (555) 123-4567",
    avatarUrl: null, // optional URL string
  });

  // persist locally so reloads keep edits (you can replace with server save later)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("boldbank_profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch (e) {
      /* ignore */
    }
  }, []);

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
