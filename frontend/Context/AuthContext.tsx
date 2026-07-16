"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { RegisterPayload, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  googleLogin: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const saveSession = (data: { access: string; refresh: string; user: User }) => {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setUser(data.user);
  };

  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const { data } = await api.get<User>("/api/profile/");
          setUser(data);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };
    syncUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/login/", { email, password });
    saveSession(data);
    router.replace("/dashboard");
  };

  const register = async (formData: RegisterPayload) => {
    const { data } = await api.post("/api/register/", formData);
    saveSession(data);
    router.replace("/dashboard");
  };

  const googleLogin = async (accessToken: string) => {
    const { data } = await api.post("/api/google-login/", { token: accessToken });
    saveSession(data);
    router.replace("/dashboard");
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await api.post("/api/logout/", { refresh: refreshToken });
      } catch {}
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
