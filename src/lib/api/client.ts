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
