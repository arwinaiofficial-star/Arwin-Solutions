/**
 * API client for communicating with the backend.
 * All auth API calls go through Next.js BFF routes which proxy to FastAPI.
 */

const API_BASE = "/api/auth";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Attach access token if available
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const body = await response.json();

    if (!response.ok) {
      return { error: body.detail || body.error || "Something went wrong" };
    }

    return { data: body as T };
  } catch {
    return { error: "Network error. Please check your connection." };
  }
}

// Auth API types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  has_resume: boolean;
}

interface AuthResponse {
  user: UserData;
  tokens: AuthTokens;
}

// Token management
function storeTokens(tokens: AuthTokens) {
  localStorage.setItem("jobready_access_token", tokens.access_token);
  localStorage.setItem("jobready_refresh_token", tokens.refresh_token);
}

function clearTokens() {
  localStorage.removeItem("jobready_access_token");
  localStorage.removeItem("jobready_refresh_token");
}

function getRefreshToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("jobready_refresh_token")
    : null;
}

// Auth API methods
export const authApi = {
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    if (result.data) {
      storeTokens(result.data.tokens);
    }
    return result;
  },

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    const result = await request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result.data) {
      storeTokens(result.data.tokens);
    }
    return result;
  },

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { error: "No refresh token" };
    }
    const result = await request<AuthTokens>("/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (result.data) {
      storeTokens(result.data);
    }
    return result;
  },

  async getMe(): Promise<ApiResponse<UserData>> {
    return request<UserData>("/me");
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    location?: string;
  }): Promise<ApiResponse<UserData>> {
    return request<UserData>("/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return request<void>("/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },

  logout() {
    clearTokens();
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("jobready_access_token");
  },
};

// Resume API methods
const RESUME_API_BASE = "/api/resume";

export const resumeApi = {
  async chat(
    message: string,
    action: string = "chat",
    context?: Record<string, unknown>
  ): Promise<ApiResponse<{ reply: string; suggestions?: string[] }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch(`${RESUME_API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, action, context }),
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.detail || body.error || "Resume chat failed" };
      }

      return { data: body };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  },

  async save(
    data: Record<string, unknown>,
    status: string = "draft"
  ): Promise<ApiResponse<{ id: string; version: number }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch(`${RESUME_API_BASE}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data, status }),
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.detail || body.error || "Resume save failed" };
      }

      return { data: body };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  },

  async getLatest(): Promise<ApiResponse<{ id: string; data: Record<string, unknown>; version: number; status: string }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch(`${RESUME_API_BASE}/latest`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.detail || body.error || "Failed to fetch resume" };
      }

      return { data: body };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  },

  async uploadCV(file: File): Promise<ApiResponse<{ rawText: string; extractedData: Record<string, unknown> | null; fileName: string }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.error || "Upload failed" };
      }

      return { data: body };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  },
};

// Chat Session API (auto-save / restore)
export const chatSessionApi = {
  async getSession(): Promise<ApiResponse<{ session: { id: string; messages: unknown[]; agent_state: Record<string, unknown>; collected_data: Record<string, unknown>; last_active_at: string } | null }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch("/api/chat/session", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const body = await response.json();
      return { data: body };
    } catch {
      return { data: { session: null } };
    }
  },

  async saveSession(data: {
    session_id?: string;
    messages: unknown[];
    agent_state: Record<string, unknown>;
    collected_data: Record<string, unknown>;
  }): Promise<ApiResponse<{ id: string }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch("/api/chat/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      const body = await response.json();
      return { data: body };
    } catch {
      return { error: "Failed to save session" };
    }
  },
};

// Social Auth
export const socialAuthApi = {
  async login(data: {
    provider: string;
    email: string;
    name: string;
    provider_id: string;
    image?: string;
  }): Promise<ApiResponse<{ user: UserData; tokens: AuthTokens }>> {
    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.error || "Social login failed" };
      }

      if (body.tokens) {
        storeTokens(body.tokens);
      }

      return { data: body };
    } catch {
      return { error: "Network error during social login" };
    }
  },
};

// Jobs Prepare to Apply
export const jobPrepareApi = {
  async prepare(data: {
    jobTitle: string;
    jobDescription?: string;
    jobCompany?: string;
    jobLocation?: string;
    cvData: Record<string, unknown>;
  }): Promise<ApiResponse<{
    aiTips: string;
    matchedSkills: string[];
    missingSkills: string[];
    matchScore: number;
    coverLetterSnippet: string;
  }>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jobready_access_token")
        : null;

    try {
      const response = await fetch("/api/jobs/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      const body = await response.json();

      if (!response.ok) {
        return { error: body.error || "Failed to prepare application tips" };
      }

      return { data: body };
    } catch {
      return { error: "Network error" };
    }
  },
};

