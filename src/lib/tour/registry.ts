import { HOME_TOUR } from "./tours/home";
import { NEW_ORDER_TOUR } from "./tours/new-order";
import { ORDER_DETAIL_TOUR } from "./tours/order-detail";
import { DASHBOARD_TOUR } from "./tours/dashboard";
import { MEASUREMENTS_TOUR } from "./tours/measurements";
import { PROFILE_EDIT_TOUR } from "./tours/profile-edit";
import { MESSAGES_TOUR } from "./tours/messages";
import type { TourDefinition, TourId } from "./types";

export const TOURS: Record<TourId, TourDefinition> = {
  home: HOME_TOUR,
  newOrder: NEW_ORDER_TOUR,
  orderDetail: ORDER_DETAIL_TOUR,
  dashboard: DASHBOARD_TOUR,
  measurements: MEASUREMENTS_TOUR,
  profileEdit: PROFILE_EDIT_TOUR,
  messages: MESSAGES_TOUR,
};

export const TOUR_IDS = Object.keys(TOURS) as TourId[];

/**
 * Canonical route for each tour. Two consumers:
 *
 * 1. ReplayMenu - navigate here before force-replaying a tour whose
 *    anchors only exist on that route.
 * 2. TourRouter - longest-prefix match of the current pathname picks
 *    which tour auto-fires on a private page.
 *
 * `home` lives on the public `/` route (outside the private layout) so
 * it keeps its own TourAutoFire there; it is listed for ReplayMenu.
 * `orderDetail` points at `/orders` for the replay-navigate step (the
 * user picks an order, the detail page fires it via the store).
 */
export const ROUTE_FOR: Record<TourId, string> = {
  home: "/",
  newOrder: "/blueprint",
  orderDetail: "/orders",
  dashboard: "/dashboard",
  measurements: "/measurements",
  profileEdit: "/profile/edit",
  messages: "/messages",
};

/**
 * Route prefixes the TourRouter matches inside the private layout,
 * longest-first so `/profile/edit` wins over `/profile` and
 * `/orders/<id>` (orderDetail) wins over `/orders` (no tour on the list
 * itself). `/` is intentionally excluded - it is public and handled by
 * its own TourAutoFire.
 */
export const PRIVATE_TOUR_ROUTES: ReadonlyArray<{
  prefix: string;
  tour: TourId;
}> = [
  { prefix: "/profile/edit", tour: "profileEdit" },
  { prefix: "/blueprint", tour: "newOrder" },
  { prefix: "/measurements", tour: "measurements" },
  { prefix: "/messages", tour: "messages" },
  { prefix: "/dashboard", tour: "dashboard" },
];

/**
 * Resolve a pathname to the tour that should auto-fire there, or null.
 * `/orders/<id>` (a detail page, two non-empty segments under /orders)
 * maps to orderDetail; the bare `/orders` list does not.
 */
export function tourForPath(pathname: string): TourId | null {
  const orderDetail = /^\/orders\/[^/]+\/?$/.test(pathname);
  if (orderDetail) return "orderDetail";

  for (const { prefix, tour } of PRIVATE_TOUR_ROUTES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return tour;
    }
  }
  return null;
}
