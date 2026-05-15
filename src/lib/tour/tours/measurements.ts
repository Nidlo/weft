import type { TourDefinition } from "../types";

/**
 * Plain ASCII only (Q-13). The "scan" and "add" anchors live on the
 * header action buttons, which render whenever you have room for more
 * profiles. On a brand-new account that is always true, so a first-time
 * visitor sees every step anchored.
 */
export const MEASUREMENTS_TOUR: TourDefinition = {
  id: "measurements",
  label: "Body Vault",
  steps: [
    {
      anchor: "measurements.header",
      title: "Save your body once",
      body: "This is your Body Vault. Store your measurements here so designers can cut your garments to fit without asking you every time.",
      placement: "bottom",
    },
    {
      anchor: "measurements.scan",
      title: "Scan with your phone",
      body: "Fitscan AI reads your measurements from a couple of photos. Stand against a plain wall, follow the prompts, and it does the measuring for you.",
      placement: "bottom",
    },
    {
      anchor: "measurements.add",
      title: "Or type them in",
      body: "Already know your numbers, or have them from a tailor? Add a profile by hand instead. You can keep up to ten profiles and set one as your default.",
      placement: "bottom",
    },
  ],
};
