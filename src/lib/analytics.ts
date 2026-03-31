import { eventsApi } from "@/lib/api/platform";

export function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  void eventsApi.track(name, properties);
}
