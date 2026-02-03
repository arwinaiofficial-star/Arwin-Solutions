"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  skills?: string[];
  experience?: number;
  preferredLocation?: string;
  expectedSalary?: string;
  cvGenerated?: boolean;
  cvData?: GeneratedCV | null;
  createdAt: string;
}

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
  status: "pending" | "submitted" | "viewed" | "shortlisted" | "rejected" | "interview";
  cvUsed: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  applications: Application[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  saveGeneratedCV: (cv: GeneratedCV) => void;
  addApplication: (app: Omit<Application, "id" | "appliedAt">) => void;
  updateApplicationStatus: (appId: string, status: Application["status"]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("jobready_user");
    const storedApps = localStorage.getItem("jobready_applications");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedApps) {
      setApplications(JSON.parse(storedApps));
    }
    setIsLoading(false);
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("jobready_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("jobready_user");
    }
  }, [user]);

  // Persist applications to localStorage
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem("jobready_applications", JSON.stringify(applications));
    }
  }, [applications]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // DEMO ONLY: In production, authentication should be handled server-side
    // with proper password hashing (bcrypt), secure sessions, and HTTPS
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage (simple demo auth)
    const storedUsers = localStorage.getItem("jobready_users") || "[]";
    const users = JSON.parse(storedUsers);
    const existingUser = users.find((u: { email: string; password: string }) => 
      u.email === email && u.password === password
    );
    
    if (existingUser) {
      setUser(existingUser.profile);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // DEMO ONLY: In production, passwords should be hashed server-side
    // Never store plain text passwords in a real application
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const storedUsers = localStorage.getItem("jobready_users") || "[]";
    const users = JSON.parse(storedUsers);
    
    if (users.some((u: { email: string }) => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user with crypto-safe ID
    const newProfile: UserProfile = {
      id: `user_${crypto.randomUUID()}`,
      email,
      name,
      cvGenerated: false,
      cvData: null,
      createdAt: new Date().toISOString(),
    };
    
    // Store user credentials (in production, this would be handled server-side with hashing)
    users.push({ email, password, profile: newProfile });
    localStorage.setItem("jobready_users", JSON.stringify(users));
    
    setUser(newProfile);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setApplications([]);
    localStorage.removeItem("jobready_user");
    localStorage.removeItem("jobready_applications");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Also update in users array
      const storedUsers = localStorage.getItem("jobready_users") || "[]";
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: { email: string }) => u.email === user.email);
      if (userIndex !== -1) {
        users[userIndex].profile = updatedUser;
        localStorage.setItem("jobready_users", JSON.stringify(users));
      }
    }
  };

  const saveGeneratedCV = (cv: GeneratedCV) => {
    if (user) {
      updateProfile({ cvGenerated: true, cvData: cv });
    }
  };

  const addApplication = (app: Omit<Application, "id" | "appliedAt">) => {
    const newApp: Application = {
      ...app,
      id: `app_${Date.now()}`,
      appliedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, newApp]);
  };

  const updateApplicationStatus = (appId: string, status: Application["status"]) => {
    setApplications(prev => 
      prev.map(app => app.id === appId ? { ...app, status } : app)
    );
  };

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
