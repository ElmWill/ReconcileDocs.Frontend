import { useEffect, useState } from "react";
import { clearAccessToken, getAccessToken, getAuthSessionUser, type AuthSessionUser } from "@/functions/authSession";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSessionUser | null>(null);

  useEffect(() => {
    setSession(getAuthSessionUser(getAccessToken()));

    const handleStorage = () => {
      setSession(getAuthSessionUser(getAccessToken()));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    clearSession: () => {
      clearAccessToken();
      setSession(null);
    }
  };
}