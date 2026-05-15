import type { TourDefinition } from "../types";

/**
 * Plain ASCII only. The "no AI characters" rule: no em-dashes, no smart
 * quotes, no ellipses. Read each step aloud — would a friend actually
 * say this while pointing at the screen? If not, rewrite.
 */
export const HOME_TOUR: TourDefinition = {
  id: "home",
  label: "Home",
  steps: [
    {
      anchor: "home.hero-cta",
      title: "Welcome to Nidlo",
      body: "This is where every order starts. Tap Browse designers to find someone whose work you like, or head to your dashboard to pick up where you left off.",
      placement: "bottom",
    },
    {
      anchor: "home.discovery-rails",
      title: "Find a designer",
      body: "These rails show top-rated, nearby, and newest designers. Tap any card to open their profile and see their work.",
      placement: "top",
    },
    {
      anchor: "home.quick-filters",
      title: "Filter by craft",
      body: "Looking for someone specific, like a wedding-dress designer or a tailor for a suit? Tap a chip to jump straight into search.",
      placement: "bottom",
    },
    {
      anchor: "home.contact",
      title: "Need help?",
      body: "Stuck on anything, scroll to the bottom and reach out to support. You can also replay any tour from Settings.",
      placement: "top",
    },
  ],
};
