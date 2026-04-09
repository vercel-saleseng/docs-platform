// React context for simulated auth. Fetches user data from /api/user.
// Supports switching between two mock users (Jane and Alex) to demonstrate
// that personalized content is dynamic and NOT cached — the static MDX shell
// stays cached, but the <UserVar /> client component islands re-fetch
// /api/user and fill in the new user's data without any cache invalidation.
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

type UserId = "jane" | "alex";

type UserContextValue = {
  user: User | null;
  loading: boolean;
  loggedIn: boolean;
  currentUserId: UserId;
  switchUser: (id: UserId) => void;
  toggleLogin: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: false,
  loggedIn: false,
  currentUserId: "jane",
  switchUser: () => {},
  toggleLogin: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<UserId>("jane");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/user?user=${currentUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [loggedIn, currentUserId]);

  const toggleLogin = () => setLoggedIn((prev) => !prev);
  const switchUser = (id: UserId) => {
    setCurrentUserId(id);
    if (!loggedIn) setLoggedIn(true);
  };

  return (
    <UserContext.Provider
      value={{ user, loading, loggedIn, currentUserId, switchUser, toggleLogin }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
