type ApiResult<T> = {
  data?: T;
  error?: string;
};

async function requestWithRefresh<T>(url: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
      if (refreshed.ok) {
        response = await fetch(url, { ...options, headers });
      }
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const body = await response.json();
    if (!response.ok) {
      return { error: body.error || body.detail || "Request failed" };
    }

    return { data: body as T };
  } catch {
    return { error: "Unable to reach the platform right now." };
  }
}

export interface EntitlementData {
  tier: string;
  price_label: string;
  billing_note: string;
  features: string[];
  transparency: string[];
}

export interface InterviewQuestion {
  question: string;
  what_good_looks_like: string;
  focus_area: string;
}

export interface InterviewPrepData {
  role: string;
  experience_band: string;
  intro: string;
  prep_areas: string[];
  questions: InterviewQuestion[];
}

export interface SalaryBenchmarkData {
  role: string;
  location: string;
  experience_years: number;
  salary_range: {
    min_lpa: number;
    median_lpa: number;
    max_lpa: number;
  };
  market_note: string;
  negotiation_levers: string[];
  comparable_titles: string[];
}

export interface PathwayData {
  current_role: string;
  target_role: string;
  readiness: string;
  adjacent_roles: string[];
  missing_skills: string[];
  ninety_day_plan: string[];
  story_angle: string;
}

export interface AnalyticsEventAck {
  accepted: boolean;
  event_id: string;
  recorded_at: string;
}

export const entitlementsApi = {
  async current() {
    return requestWithRefresh<EntitlementData>("/api/entitlements");
  },
};

export const interviewApi = {
  async generate(input: { role: string; experienceYears: number; focus: string }) {
    return requestWithRefresh<InterviewPrepData>("/api/interviews/generate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export const salaryApi = {
  async benchmark(input: { role: string; location: string; experienceYears: number }) {
    return requestWithRefresh<SalaryBenchmarkData>("/api/salary/benchmark", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export const pathwaysApi = {
  async recommend(input: { currentRole: string; targetRole: string; skills: string[] }) {
    return requestWithRefresh<PathwayData>("/api/pathways/recommend", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export const eventsApi = {
  async track(name: string, properties: Record<string, unknown> = {}) {
    return requestWithRefresh<AnalyticsEventAck>("/api/events", {
      method: "POST",
      body: JSON.stringify({ name, properties }),
    });
  },
};
