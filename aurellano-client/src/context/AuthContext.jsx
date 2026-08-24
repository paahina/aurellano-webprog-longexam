import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, logoutRequest, sessionRequest, signupRequest } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "aurellano_token";
const USER_KEY = "aurellano_user";
const STORAGE_TYPE_KEY = "aurellano_storage";

const getStore = (rememberMe) => (rememberMe ? window.localStorage : window.sessionStorage);

const readStoredSession = () => {
  try {
    const storageType = window.localStorage.getItem(STORAGE_TYPE_KEY) || "session";
    const store = storageType === "local" ? window.localStorage : window.sessionStorage;
    const token = store.getItem(TOKEN_KEY);
    const rawUser = store.getItem(USER_KEY);
    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null,
      rememberMe: storageType === "local",
    };
  } catch {
    return { token: null, user: null, rememberMe: false };
  }
};

const persistSession = (token, user, rememberMe) => {
  const store = getStore(rememberMe);
  const other = rememberMe ? window.sessionStorage : window.localStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? "local" : "session");
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
};

const clearSession = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(STORAGE_TYPE_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const stored = readStoredSession();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [loading, setLoading] = useState(Boolean(stored.token));

  const applySession = useCallback((nextToken, nextUser, rememberMe) => {
    persistSession(nextToken, nextUser, rememberMe);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const current = readStoredSession();
      if (!current.token) {
        setLoading(false);
        return;
      }

      try {
        const data = await sessionRequest(current.token);
        if (!cancelled) applySession(current.token, data.user, current.rememberMe);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [applySession, clearAuth]);

  const login = useCallback(
    async (credentials) => {
      const data = await loginRequest(credentials);
      applySession(data.token, data.user, Boolean(credentials.rememberMe));
      return data.user;
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await signupRequest(payload);
      applySession(data.token, data.user, true);
      return data.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      if (token) await logoutRequest(token);
    } catch {
      // Clear local session even if the server already rejected the token.
    }
    clearAuth();
  }, [token, clearAuth]);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    const current = readStoredSession();
    if (current.token && nextUser) {
      persistSession(current.token, nextUser, current.rememberMe);
    }
  }, []);

  const value = useMemo(
    () => ({ token, user, setUser: persistUser, loading, login, signup, logout }),
    [token, user, loading, login, signup, logout, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook export is fine; Fast Refresh only prefers component-only files.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
