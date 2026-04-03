const ONBOARDING_KEY_PREFIX = "jobready_onboarding_v1";

function getKey(userId: string) {
  return `${ONBOARDING_KEY_PREFIX}:${userId}`;
}

function readState(userId: string): "pending" | "completed" | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(getKey(userId)) as "pending" | "completed" | null;
}

export function markOnboardingPending(userId: string | null | undefined) {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(getKey(userId), "pending");
}

export function markOnboardingCompleted(userId: string | null | undefined) {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(getKey(userId), "completed");
}

export function hasPendingOnboarding(userId: string | null | undefined) {
  if (!userId) return false;
  return readState(userId) === "pending";
}

export function hasCompletedOnboarding(userId: string | null | undefined) {
  if (!userId) return false;
  return readState(userId) === "completed";
}
