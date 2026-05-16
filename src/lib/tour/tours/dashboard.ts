import type { TourDefinition } from "../types";

/**
 * Plain ASCII only (Q-13). Works for both clients and designers - the
 * dashboard renders different content per role but the greeting and the
 * quick-actions grid exist in both, so the copy stays role-neutral.
 */
export const DASHBOARD_TOUR: TourDefinition = {
  id: "dashboard",
  label: "Dashboard",
  steps: [
    {
      anchor: "dashboard.greeting",
      title: "This is your home base",
      body: "Everything you do on Nidlo starts here. We will point out the few things worth knowing, then get out of your way.",
      placement: "bottom",
    },
    {
      anchor: "dashboard.actions",
      title: "Your quick actions",
      body: "These cards are the shortcuts you will use most. Find a designer, save your measurements, check your orders, or open your profile. Tap any one to jump straight in.",
      placement: "top",
    },
  ],
};
