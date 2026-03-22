"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, resumeApi, UserData } from "@/lib/api/client";

// ─── Shared types ───────────────────────────────────────────────────────────

export interface GeneratedCV {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications?: string[];
  languages?: string[];
  createdAt: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: number;
  preferredLocation?: string;
  expectedSalary?: string;
  is_active?: boolean;
  cvGenerated?: boolean;
  cvData?: GeneratedCV | null;
  createdAt: string;
}

// ─── Context type ───────────────────────────────────────────────────────────
// NOTE: Applications/tracked jobs are NO LONGER in AuthContext.
// They live in the database, accessed via applicationsApi in the dashboard.
// AuthContext handles ONLY: auth state, user profile, and CV data.

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  saveGeneratedCV: (cv: GeneratedCV) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapUserDataToProfile(data: UserData): UserProfile {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone || undefined,
    location: data.location || undefined,
    is_active: data.is_active,
    cvGenerated: data.has_resume,
    cvData: null,
    createdAt: data.created_at,
  };
}

/**
 * Load CV data — always from DB (source of truth).
 * Uses localStorage only as a fast cache layer.
 */
async function loadCVData(hasResume: boolean): Promise<GeneratedCV | null> {
  if (!hasResume) return null;

  // Always fetch from DB — it's the source of truth
  try {
    const result = await resumeApi.getLatest();
    if (result.data?.data) {
      const cvData = result.data.data as unknown as GeneratedCV;
      return cvData;
    }
  } catch {
    // Network error — can't load, user starts fresh
  }

  return null;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUserWithCV = useCallback(async (profile: UserProfile) => {
    setUser(profile);
    const cvData = await loadCVData(profile.cvGenerated ?? false);
    if (cvData) {
      setUser(prev => prev ? { ...prev, cvGenerated: true, cvData } : prev);
    }
  }, []);

  // On mount: validate token and load user
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("jobready_access_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const result = await authApi.getMe();
      if (result.data) {
        await setUserWithCV(mapUserDataToProfile(result.data));
      } else {
        // Token expired — try refresh
        const refreshResult = await authApi.refreshToken();
        if (refreshResult.data) {
          const meResult = await authApi.getMe();
          if (meResult.data) {
            await setUserWithCV(mapUserDataToProfile(meResult.data));
          } else {
            // Refresh succeeded but /me still failed — force clean state
            authApi.logout();
            setUser(null);
          }
        } else {
          // Refresh failed — force clean state so login works fresh
          authApi.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Clear any previous user's state before logging in a new user
      setUser(null);

      const result = await authApi.login(email, password);
      if (result.error) return { success: false, error: result.error };
      if (result.data) {
        await setUserWithCV(mapUserDataToProfile(result.data.user));
        return { success: true };
      }
      return { success: false, error: "Unknown error" };
    },
    [setUserWithCV]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      const result = await authApi.register(email, password, name);
      if (result.error) return { success: false, error: result.error };
      if (result.data) {
        setUser(mapUserDataToProfile(result.data.user));
        return { success: true };
      }
      return { success: false, error: "Unknown error" };
    },
    []
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    // Force a hard navigation to clear ALL component-level cached state.
    // This prevents any stale data from the previous user leaking into
    // the next session in the same browser.
    if (typeof window !== "undefined") {
      window.location.href = "/jobready/login";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authApi.getMe();
    if (result.data) {
      await setUserWithCV(mapUserDataToProfile(result.data));
    }
  }, [setUserWithCV]);

  const updateProfile = useCallback(
    (data: Partial<UserProfile>) => {
      if (user) {
        setUser({ ...user, ...data });
        const serverUpdate: Record<string, string> = {};
        if (data.name) serverUpdate.name = data.name;
        if (data.phone) serverUpdate.phone = data.phone;
        if (data.location) serverUpdate.location = data.location;
        if (Object.keys(serverUpdate).length > 0) {
          authApi.updateProfile(serverUpdate);
        }
      }
    },
    [user]
  );

  const saveGeneratedCV = useCallback(
    (cv: GeneratedCV) => {
      if (user) {
        setUser(prev => prev ? { ...prev, cvGenerated: true, cvData: cv } : prev);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        saveGeneratedCV,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
