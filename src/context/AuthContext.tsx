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

// Re-export types that the rest of the app uses
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

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary?: string;
  appliedAt: string;
  status:
    | "pending"
    | "submitted"
    | "viewed"
    | "shortlisted"
    | "rejected"
    | "interview";
  cvUsed: string;
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

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  applications: Application[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  saveGeneratedCV: (cv: GeneratedCV) => void;
  addApplication: (app: Omit<Application, "id" | "appliedAt">) => void;
  updateApplicationStatus: (
    appId: string,
    status: Application["status"]
  ) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserDataToProfile(data: UserData): UserProfile {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone || undefined,
    location: data.location || undefined,
    is_active: data.is_active,
    cvGenerated: data.has_resume,
    cvData: null, // Will be loaded from DB or localStorage
    createdAt: data.created_at,
  };
}

function getStoredApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("jobready_applications");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getStoredCV(): GeneratedCV | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jobready_cv_data");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Load CV data from the best available source:
 * 1. Try localStorage first (faster, no network)
 * 2. If not in localStorage but user has_resume, fetch from backend DB
 * 3. Cache the DB result back into localStorage for next time
 */
async function loadCVData(hasResume: boolean): Promise<GeneratedCV | null> {
  // 1. Try localStorage
  const localCV = getStoredCV();
  if (localCV) return localCV;

  // 2. If backend says user has a resume, fetch it
  if (hasResume) {
    try {
      const result = await resumeApi.getLatest();
      if (result.data?.data) {
        const cvData = result.data.data as unknown as GeneratedCV;
        // Cache to localStorage for faster next load
        localStorage.setItem("jobready_cv_data", JSON.stringify(cvData));
        return cvData;
      }
    } catch {
      // Silently fail — user can still build a new resume
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: set user profile with CV data loaded from best source
  const setUserWithCV = useCallback(async (profile: UserProfile) => {
    // Set user immediately (don't block on CV load)
    setUser(profile);

    // Then load CV data asynchronously
    const cvData = await loadCVData(profile.cvGenerated ?? false);
    if (cvData) {
      setUser(prev => prev ? { ...prev, cvGenerated: true, cvData } : prev);
    }
  }, []);

  // On mount, check if we have a valid token and load user
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("jobready_access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get current user with existing token
      const result = await authApi.getMe();
      if (result.data) {
        const profile = mapUserDataToProfile(result.data);
        setApplications(getStoredApplications());
        await setUserWithCV(profile);
      } else {
        // Token might be expired, try refresh
        const refreshResult = await authApi.refreshToken();
        if (refreshResult.data) {
          const meResult = await authApi.getMe();
          if (meResult.data) {
            const profile = mapUserDataToProfile(meResult.data);
            setApplications(getStoredApplications());
            await setUserWithCV(profile);
          } else {
            authApi.logout();
          }
        } else {
          // Both failed, clear tokens
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist applications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && applications.length > 0) {
      localStorage.setItem(
        "jobready_applications",
        JSON.stringify(applications)
      );
    }
  }, [applications]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await authApi.login(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data) {
        const profile = mapUserDataToProfile(result.data.user);
        setApplications(getStoredApplications());
        // Load CV from DB if available (critical for returning users)
        await setUserWithCV(profile);
        return { success: true };
      }
      return { success: false, error: "Unknown error" };
    },
    [setUserWithCV]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await authApi.register(email, password, name);
      if (result.error) {
        return { success: false, error: result.error };
      }
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
    setApplications([]);
    // Note: We keep jobready_cv_data in localStorage as a cache.
    // On next login, loadCVData() will use it or fetch from DB.
    // Only clear the applications which are purely local.
    localStorage.removeItem("jobready_applications");
    // Don't remove CV data — it's a cache, not auth state
    // localStorage.removeItem("jobready_cv_data");
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authApi.getMe();
    if (result.data) {
      const profile = mapUserDataToProfile(result.data);
      await setUserWithCV(profile);
    }
  }, [setUserWithCV]);

  const updateProfile = useCallback(
    (data: Partial<UserProfile>) => {
      if (user) {
        setUser({ ...user, ...data });
        // Also update server-side if name/phone/location changed
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
        const updated = { ...user, cvGenerated: true, cvData: cv };
        setUser(updated);
        // Persist to localStorage as cache
        localStorage.setItem("jobready_cv_data", JSON.stringify(cv));
      }
    },
    [user]
  );

  const addApplication = useCallback(
    (app: Omit<Application, "id" | "appliedAt">) => {
      const newApp: Application = {
        ...app,
        id: `app_${Date.now()}`,
        appliedAt: new Date().toISOString(),
      };
      setApplications((prev) => [...prev, newApp]);
    },
    []
  );

  const updateApplicationStatus = useCallback(
    (appId: string, status: Application["status"]) => {
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        applications,
        login,
        signup,
        logout,
        updateProfile,
        saveGeneratedCV,
        addApplication,
        updateApplicationStatus,
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
