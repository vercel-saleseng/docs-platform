// React context for simulated auth. Fetches user data from /api/user.
// When "logged in", makes a real API call (with 300ms server delay) to
// demonstrate that personalized content is dynamic and streams in after
// the cached static shell — the core PPR demo.
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type User = {
  name: string;
  apiKey: string;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  loggedIn: boolean;
  toggleLogin: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: false,
  loggedIn: false,
  toggleLogin: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [loggedIn]);

  const toggleLogin = () => setLoggedIn((prev) => !prev);

  return (
    <UserContext.Provider value={{ user, loading, loggedIn, toggleLogin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
