/**
 * API client for communicating with the backend.
 * All auth API calls go through Next.js BFF routes which proxy to FastAPI.
 *
 * Key platform behaviors:
 * - Automatic cookie-based session refresh on 401
 * - Consistent error handling across all endpoints
 * - Local persistence only for non-sensitive resume drafts
 */

const API_BASE = "/api/auth";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

// ─── Session helpers ────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

const USER_SCOPE_KEY = "jobready_user_scope";

function clearLegacyTokenStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("jobready_access_token");
  localStorage.removeItem("jobready_refresh_token");
}

function setCurrentUserScope(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(USER_SCOPE_KEY, userId);
  } else {
    localStorage.removeItem(USER_SCOPE_KEY);
  }
}

// ─── Refresh lock (prevent concurrent refresh attempts) ─────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─── Core request function with auto-refresh ────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return { data: undefined as T };
    }

    // Auto-refresh on 401 (token expired)
    if (response.status === 401 && !endpoint.includes("/refresh") && !endpoint.includes("/login") && !endpoint.includes("/register")) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        const retryHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        };
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        });

        if (retryResponse.status === 204) {
          return { data: undefined as T };
        }
        const retryBody = await retryResponse.json();
        if (!retryResponse.ok) {
          return { error: retryBody.detail || retryBody.error || "Something went wrong" };
        }
        return { data: retryBody as T };
      }
      // Refresh failed — force re-login
      return { error: "Session expired. Please log in again." };
    }

    const body = await response.json();

    if (!response.ok) {
      return { error: body.detail || body.error || "Something went wrong" };
    }

    return { data: body as T };
  } catch {
    return { error: "Unable to reach server. Please try again in a moment." };
  }
}

/**
 * Authenticated fetch wrapper for non-auth API endpoints (resume, jobs, etc.).
 * Includes automatic token refresh on 401.
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  let response = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return response;
}

// ─── Auth API types ─────────────────────────────────────────────────────────

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

// ─── Auth API ───────────────────────────────────────────────────────────────

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
      clearLegacyTokenStorage();
      setCurrentUserScope(result.data.user.id);
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
      clearLegacyTokenStorage();
      setCurrentUserScope(result.data.user.id);
    }
    return result;
  },

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const result = await request<AuthTokens>("/refresh", {
      method: "POST",
    });
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
    clearLegacyTokenStorage();
    setCurrentUserScope(null);
    void fetch("/api/auth/logout", { method: "POST", keepalive: true });
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const scope = localStorage.getItem(USER_SCOPE_KEY);
    return !!scope && scope !== "anonymous";
  },
};

// ─── Resume API ─────────────────────────────────────────────────────────────

const RESUME_API_BASE = "/api/resume";

export const resumeApi = {
  async chat(
    message: string,
    action: string = "chat",
    context?: Record<string, unknown>
  ): Promise<ApiResponse<{ reply: string; suggestions?: string[]; data?: Record<string, unknown> }>> {
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, status }),
      });

      const body = await response.json();
      if (!response.ok) {
        return { error: body.detail || body.error || "Resume save failed" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to save your resume right now." };
    }
  },

  async getLatest(): Promise<
    ApiResponse<{
      id: string;
      data: Record<string, unknown>;
      version: number;
      status: string;
    }>
  > {
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/latest`, {});

      const body = await response.json();
      if (!response.ok) {
        return {
          error: body.detail || body.error || "Failed to fetch resume",
        };
      }
      return { data: body };
    } catch {
      return { error: "Unable to load your resume right now." };
    }
  },

  async reset(): Promise<ApiResponse<void>> {
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/latest`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        return { data: undefined };
      }

      const body = await response.json();
      if (!response.ok) {
        return { error: body.detail || body.error || "Failed to reset resume" };
      }

      return { data: undefined };
    } catch {
      return { error: "Unable to reset your resume right now." };
    }
  },

  async importLinkedIn(
    linkedinUrl: string
  ): Promise<ApiResponse<{ data: Record<string, unknown> }>> {
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/linkedin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedin_url: linkedinUrl }),
      });

      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "LinkedIn import failed" };
      }
      return { data: body };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  },

  async uploadCV(
    file: File
  ): Promise<
    ApiResponse<{
      rawText: string;
      extractedData: Record<string, unknown> | null;
      fileName: string;
    }>
  > {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Don't set Content-Type — browser will set multipart boundary
      const response = await authenticatedFetch("/api/resume/upload", {
        method: "POST",
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

// ─── Chat Session API ───────────────────────────────────────────────────────

export const chatSessionApi = {
  async getSession(): Promise<
    ApiResponse<{
      session: {
        id: string;
        messages: unknown[];
        agent_state: Record<string, unknown>;
        collected_data: Record<string, unknown>;
        last_active_at: string;
      } | null;
    }>
  > {
    try {
      const response = await authenticatedFetch("/api/chat/session", {});
      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "Failed to load session" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to load session right now." };
    }
  },

  async saveSession(data: {
    session_id?: string;
    messages: unknown[];
    agent_state: Record<string, unknown>;
    collected_data: Record<string, unknown>;
  }): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await authenticatedFetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "Failed to save session" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to save session right now." };
    }
  },
};

// ─── Social Auth ────────────────────────────────────────────────────────────

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
        clearLegacyTokenStorage();
        setCurrentUserScope(body.user?.id || null);
      }
      return { data: body };
    } catch {
      return { error: "Network error during social login" };
    }
  },
};

// ─── Job Applications (DB-backed, replaces localStorage) ────────────────────

export interface JobApplicationData {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string | null;
  job_url: string | null;
  salary: string | null;
  source: string | null;
  status: string;
  resume_id: string | null;
  notes: string | null;
  description: string | null;
  applied_at: string;
  updated_at: string;
}

export const applicationsApi = {
  async list(status?: string): Promise<ApiResponse<JobApplicationData[]>> {
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const response = await authenticatedFetch(`/api/applications${qs}`, {});
      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "Failed to load applications" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to load applications right now." };
    }
  },

  async create(data: {
    job_title: string;
    company: string;
    location?: string;
    job_url?: string;
    salary?: string;
    source?: string;
    status?: string;
    notes?: string;
    description?: string;
  }): Promise<ApiResponse<JobApplicationData>> {
    try {
      const response = await authenticatedFetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "Failed to save application" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to save application right now." };
    }
  },

  async update(
    id: string,
    data: { status?: string; notes?: string; job_url?: string; salary?: string }
  ): Promise<ApiResponse<JobApplicationData>> {
    try {
      const response = await authenticatedFetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok) {
        return { error: body.error || body.detail || "Failed to update application" };
      }
      return { data: body };
    } catch {
      return { error: "Unable to update application right now." };
    }
  },

  async remove(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await authenticatedFetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (response.status === 204 || response.ok) {
        return { data: undefined };
      }
      const body = await response.json();
      return { error: body.error || body.detail || "Failed to delete application" };
    } catch {
      return { error: "Unable to delete application right now." };
    }
  },
};

// ─── Jobs Prepare to Apply ──────────────────────────────────────────────────

export const jobPrepareApi = {
  async prepare(data: {
    jobTitle: string;
    jobDescription?: string;
    jobCompany?: string;
    jobLocation?: string;
    cvData: Record<string, unknown>;
  }): Promise<
    ApiResponse<{
      aiTips: string;
      matchedSkills: string[];
      missingSkills: string[];
      matchScore: number;
      coverLetterSnippet: string;
    }>
  > {
    try {
      const response = await authenticatedFetch("/api/jobs/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await response.json();
      if (!response.ok) {
        return {
          error: body.error || "Failed to prepare application tips",
        };
      }
      return { data: body };
    } catch {
      return { error: "Network error" };
    }
  },
};
