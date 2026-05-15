import { HOME_TOUR } from "./tours/home";
import { NEW_ORDER_TOUR } from "./tours/new-order";
import { ORDER_DETAIL_TOUR } from "./tours/order-detail";
import type { TourDefinition, TourId } from "./types";

export const TOURS: Record<TourId, TourDefinition> = {
  home: HOME_TOUR,
  newOrder: NEW_ORDER_TOUR,
  orderDetail: ORDER_DETAIL_TOUR,
};

export const TOUR_IDS = Object.keys(TOURS) as TourId[];
