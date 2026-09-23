import { useEffect, useSyncExternalStore } from "react";
import { enableBrowserUserData, getUserData, subscribe, type UserData } from "@/services/user-data";

const serverSnapshot: UserData = { version: 1, attempts: [], stats: {}, days: {} };

/**
 * Subscribes to the stored learner data. During SSR/hydration an empty
 * snapshot is used, then React re-renders with the persisted values.
 * Components derive what they need with the selectors in services/user-data.
 */
export function useUserData() {
  const data = useSyncExternalStore(subscribe, getUserData, () => serverSnapshot);
  useEffect(() => enableBrowserUserData(), []);
  return data;
}
