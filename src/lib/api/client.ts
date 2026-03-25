/**
 * API client for communicating with the backend.
 * All auth API calls go through Next.js BFF routes which proxy to FastAPI.
 *
 * Key reliability features:
 * - Automatic token refresh on 401 (transparent retry)
 * - Centralized auth header management
 * - Consistent error handling across all endpoints
 */

const API_BASE = "/api/auth";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

// ─── Backend wake-up retry (client-side, no Vercel timeout limit) ────────────

const WAKE_MAX_RETRIES = 3;
const WAKE_RETRY_DELAY_MS = 4_000;

async function shouldRetry503(response: Response): Promise<boolean> {
  if (response.status !== 503) return false;

  try {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return true;
    }

    const body = await response.clone().json() as { error?: string; detail?: string };
    const message = body.error || body.detail || "";
    if (message.includes("Configured backend does not support")) {
      return false;
    }
  } catch {
    // Fall through to retry for transient/non-JSON 503s.
  }

  return true;
}

/**
 * Fetch with automatic retry on 503 (backend sleeping / cold start).
 * Runs in the browser — no serverless timeout constraint.
 */
async function fetchWithWakeRetry(
  url: string,
  options: RequestInit,
  retries = WAKE_MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);

    // 503 = BFF couldn't reach backend (cold start). Retry after delay.
    if (attempt < retries && await shouldRetry503(response)) {
      await new Promise((r) => setTimeout(r, WAKE_RETRY_DELAY_MS));
      continue;
    }

    return response;
  }

  // Should never reach here
  return fetch(url, options);
}

// ─── Token management ────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

function storeTokens(tokens: AuthTokens) {
  localStorage.setItem("jobready_access_token", tokens.access_token);
  localStorage.setItem("jobready_refresh_token", tokens.refresh_token);
}

function clearTokens() {
  localStorage.removeItem("jobready_access_token");
  localStorage.removeItem("jobready_refresh_token");
}

function getAccessToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("jobready_access_token")
    : null;
}

function getRefreshToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("jobready_refresh_token")
    : null;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseTokenPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function currentUserStorageScope(): string {
  if (typeof window === "undefined") return "server";
  const payload = parseTokenPayload(getAccessToken());
  const sub = typeof payload?.sub === "string" ? payload.sub : "anonymous";
  return sub;
}

function scopedStorageKey(base: string): string {
  return `${base}:${currentUserStorageScope()}`;
}

function readScopedStorage<T>(base: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(scopedStorageKey(base));
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeScopedStorage<T>(base: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(scopedStorageKey(base), JSON.stringify(value));
}

function makeLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function shouldUseLocalFallback(status: number, error?: string): boolean {
  if (status === 503 || status === 405) return true;
  return Boolean(error && (
    error.includes("Configured backend does not support") ||
    error.includes("Unable to connect to backend") ||
    error.includes("Network error")
  ));
}

type LocalResumeRecord = {
  id: string;
  data: Record<string, unknown>;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const LOCAL_RESUME_KEY = "jobready_resume_records";
const LOCAL_APPLICATIONS_KEY = "jobready_application_records";
const LOCAL_CHAT_SESSION_KEY = "jobready_chat_session";

function readLocalResumeRecords(): LocalResumeRecord[] {
  return readScopedStorage<LocalResumeRecord[]>(LOCAL_RESUME_KEY, []);
}

function writeLocalResumeRecords(records: LocalResumeRecord[]) {
  writeScopedStorage(LOCAL_RESUME_KEY, records);
}

function clearLocalResumeRecords() {
  writeLocalResumeRecords([]);
}

function cacheLatestResume(record: LocalResumeRecord) {
  const records = readLocalResumeRecords();
  const nextRecords = records.filter((item) => item.id !== record.id);
  nextRecords.push(record);
  writeLocalResumeRecords(nextRecords);
}

function saveResumeLocally(
  data: Record<string, unknown>,
  status: string
): { id: string; version: number; status: string; created_at: string } {
  const now = new Date().toISOString();
  const records = readLocalResumeRecords().sort((a, b) => b.version - a.version);
  const latest = records[0];

  if (status === "draft" && latest?.status === "draft") {
    const updated: LocalResumeRecord = {
      ...latest,
      data,
      updated_at: now,
    };
    writeLocalResumeRecords([updated, ...records.slice(1)]);
    return {
      id: updated.id,
      version: updated.version,
      status: updated.status,
      created_at: updated.created_at,
    };
  }

  const record: LocalResumeRecord = {
    id: makeLocalId("resume"),
    data,
    version: (latest?.version || 0) + 1,
    status,
    created_at: now,
    updated_at: now,
  };
  writeLocalResumeRecords([...records, record]);
  return {
    id: record.id,
    version: record.version,
    status: record.status,
    created_at: record.created_at,
  };
}

function getLatestLocalResume(): LocalResumeRecord | null {
  const records = readLocalResumeRecords();
  if (records.length === 0) return null;
  return [...records].sort((a, b) => {
    if (b.version !== a.version) return b.version - a.version;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  })[0];
}

// ─── Refresh lock (prevent concurrent refresh attempts) ─────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const body = await response.json();
      if (body.access_token && body.refresh_token) {
        storeTokens(body as AuthTokens);
        return true;
      }
      clearTokens();
      return false;
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
      ...authHeaders(),
    };

    const response = await fetchWithWakeRetry(`${API_BASE}${endpoint}`, {
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
          ...authHeaders(), // fresh token
        };
        const retryResponse = await fetchWithWakeRetry(`${API_BASE}${endpoint}`, {
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
    ...authHeaders(),
  };

  let response = await fetchWithWakeRetry(url, { ...options, headers });

  // Auto-refresh on 401
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
        ...authHeaders(), // fresh token
      };
      response = await fetchWithWakeRetry(url, { ...options, headers: retryHeaders });
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
    return !!getAccessToken();
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
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          return { data: saveResumeLocally(data, status) };
        }
        return { error: body.detail || body.error || "Resume save failed" };
      }
      if (body.id && body.version) {
        cacheLatestResume({
          id: body.id as string,
          data,
          version: body.version as number,
          status: (body.status as string) || status,
          created_at: (body.created_at as string) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return { data: body };
    } catch {
      return { data: saveResumeLocally(data, status) };
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
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          const localResume = getLatestLocalResume();
          if (!localResume) {
            return { error: "No resume found" };
          }
          return {
            data: {
              id: localResume.id,
              data: localResume.data,
              version: localResume.version,
              status: localResume.status,
            },
          };
        }
        return {
          error: body.detail || body.error || "Failed to fetch resume",
        };
      }
      if (body.id && body.data) {
        cacheLatestResume({
          id: body.id as string,
          data: body.data as Record<string, unknown>,
          version: (body.version as number) || 1,
          status: (body.status as string) || "final",
          created_at: (body.created_at as string) || new Date().toISOString(),
          updated_at: (body.updated_at as string) || new Date().toISOString(),
        });
      }
      return { data: body };
    } catch {
      const localResume = getLatestLocalResume();
      if (!localResume) {
        return { error: "Network error. Please check your connection." };
      }
      return {
        data: {
          id: localResume.id,
          data: localResume.data,
          version: localResume.version,
          status: localResume.status,
        },
      };
    }
  },

  async reset(): Promise<ApiResponse<void>> {
    try {
      const response = await authenticatedFetch(`${RESUME_API_BASE}/latest`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        clearLocalResumeRecords();
        return { data: undefined };
      }

      const body = await response.json();
      if (!response.ok) {
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          clearLocalResumeRecords();
          return { data: undefined };
        }
        return { error: body.detail || body.error || "Failed to reset resume" };
      }

      clearLocalResumeRecords();
      return { data: undefined };
    } catch {
      clearLocalResumeRecords();
      return { data: undefined };
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
        return { data: { session: readLocalChatSession() } };
      }
      return { data: body };
    } catch {
      return { data: { session: readLocalChatSession() } };
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
        const now = new Date().toISOString();
        const session = {
          id: data.session_id || makeLocalId("session"),
          messages: data.messages,
          agent_state: data.agent_state,
          collected_data: data.collected_data,
          last_active_at: now,
        };
        writeLocalChatSession(session);
        return { data: { id: session.id } };
      }
      writeLocalChatSession({
        id: (body.id as string) || data.session_id || makeLocalId("session"),
        messages: data.messages,
        agent_state: data.agent_state,
        collected_data: data.collected_data,
        last_active_at: (body.last_active_at as string) || new Date().toISOString(),
      });
      return { data: body };
    } catch {
      const now = new Date().toISOString();
      const session = {
        id: data.session_id || makeLocalId("session"),
        messages: data.messages,
        agent_state: data.agent_state,
        collected_data: data.collected_data,
        last_active_at: now,
      };
      writeLocalChatSession(session);
      return { data: { id: session.id } };
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
        storeTokens(body.tokens);
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

function readLocalApplications(): JobApplicationData[] {
  return readScopedStorage<JobApplicationData[]>(LOCAL_APPLICATIONS_KEY, []);
}

function writeLocalApplications(applications: JobApplicationData[]) {
  writeScopedStorage(LOCAL_APPLICATIONS_KEY, applications);
}

function createLocalApplication(data: {
  job_title: string;
  company: string;
  location?: string;
  job_url?: string;
  salary?: string;
  source?: string;
  status?: string;
  notes?: string;
  description?: string;
}): JobApplicationData {
  const now = new Date().toISOString();
  const application: JobApplicationData = {
    id: makeLocalId("app"),
    user_id: currentUserStorageScope(),
    job_title: data.job_title,
    company: data.company,
    location: data.location || null,
    job_url: data.job_url || null,
    salary: data.salary || null,
    source: data.source || null,
    status: data.status || "saved",
    resume_id: null,
    notes: data.notes || null,
    description: data.description || null,
    applied_at: now,
    updated_at: now,
  };
  const applications = readLocalApplications();
  writeLocalApplications([application, ...applications]);
  return application;
}

function updateLocalApplication(
  id: string,
  data: { status?: string; notes?: string; job_url?: string; salary?: string }
): JobApplicationData | null {
  const now = new Date().toISOString();
  let updatedApp: JobApplicationData | null = null;
  const applications = readLocalApplications().map((application) => {
    if (application.id !== id) return application;
    updatedApp = {
      ...application,
      ...data,
      updated_at: now,
    };
    return updatedApp;
  });
  writeLocalApplications(applications);
  return updatedApp;
}

function removeLocalApplication(id: string): boolean {
  const applications = readLocalApplications();
  const nextApplications = applications.filter((application) => application.id !== id);
  writeLocalApplications(nextApplications);
  return nextApplications.length !== applications.length;
}

type LocalChatSession = {
  id: string;
  messages: unknown[];
  agent_state: Record<string, unknown>;
  collected_data: Record<string, unknown>;
  last_active_at: string;
};

function readLocalChatSession(): LocalChatSession | null {
  return readScopedStorage<LocalChatSession | null>(LOCAL_CHAT_SESSION_KEY, null);
}

function writeLocalChatSession(session: LocalChatSession | null) {
  writeScopedStorage(LOCAL_CHAT_SESSION_KEY, session);
}

export const applicationsApi = {
  async list(status?: string): Promise<ApiResponse<JobApplicationData[]>> {
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const response = await authenticatedFetch(`/api/applications${qs}`, {});
      const body = await response.json();
      if (!response.ok) {
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          const localApplications = readLocalApplications()
            .filter((application) => !status || application.status === status)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          return { data: localApplications };
        }
        return { error: body.error || "Failed to load applications" };
      }
      if (Array.isArray(body)) {
        writeLocalApplications(body as JobApplicationData[]);
      }
      return { data: body };
    } catch {
      const localApplications = readLocalApplications()
        .filter((application) => !status || application.status === status)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      return { data: localApplications };
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
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          return { data: createLocalApplication(data) };
        }
        return { error: body.error || "Failed to save application" };
      }
      if (body?.id) {
        const applications = readLocalApplications();
        writeLocalApplications([
          body as JobApplicationData,
          ...applications.filter((application) => application.id !== (body as JobApplicationData).id),
        ]);
      }
      return { data: body };
    } catch {
      return { data: createLocalApplication(data) };
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
        if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
          const updated = updateLocalApplication(id, data);
          return updated ? { data: updated } : { error: "Application not found" };
        }
        return { error: body.error || "Failed to update application" };
      }
      if (body?.id) {
        const applications = readLocalApplications().map((application) =>
          application.id === (body as JobApplicationData).id ? body as JobApplicationData : application
        );
        writeLocalApplications(applications);
      }
      return { data: body };
    } catch {
      const updated = updateLocalApplication(id, data);
      return updated ? { data: updated } : { error: "Network error" };
    }
  },

  async remove(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await authenticatedFetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (response.status === 204 || response.ok) {
        removeLocalApplication(id);
        return { data: undefined };
      }
      const body = await response.json();
      if (shouldUseLocalFallback(response.status, body.error || body.detail)) {
        removeLocalApplication(id);
        return { data: undefined };
      }
      return { error: body.error || "Failed to delete application" };
    } catch {
      removeLocalApplication(id);
      return { data: undefined };
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
