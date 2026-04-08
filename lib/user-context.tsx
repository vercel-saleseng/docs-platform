// React context for simulated auth. No real auth — just a toggle.
// Provides mock user data when "logged in", null when "logged out".
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type User = {
  name: string;
  apiKey: string;
};

type UserContextValue = {
  user: User | null;
  toggleLogin: () => void;
};

const MOCK_USER: User = {
  name: "Jane Developer",
  apiKey: "sk_live_abc123xyz789",
};

const UserContext = createContext<UserContextValue>({
  user: null,
  toggleLogin: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const toggleLogin = () => setUser((prev) => (prev ? null : MOCK_USER));
  return (
    <UserContext.Provider value={{ user, toggleLogin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
