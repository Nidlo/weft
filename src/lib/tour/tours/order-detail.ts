import type { TourDefinition } from "../types";

export const ORDER_DETAIL_TOUR: TourDefinition = {
  id: "orderDetail",
  label: "Following your order",
  steps: [
    {
      anchor: "orderDetail.status",
      title: "Where things stand",
      body: "This badge shows the current stage of your order, from confirmed to delivered. It updates the moment the designer moves it forward.",
      placement: "bottom",
    },
    {
      anchor: "orderDetail.progress",
      title: "The full journey",
      body: "Every stage your garment passes through shows up here, with the photos and notes the designer attached along the way.",
      placement: "top",
    },
    {
      anchor: "orderDetail.negotiate",
      title: "Bargaining and price changes",
      body: "If you don't agree on price yet, you can counter the designer's offer here. The order stays paused until you both settle on a number.",
      placement: "top",
    },
    {
      anchor: "orderDetail.payment",
      title: "Paying for the work",
      body: "Pay your deposit when the order is confirmed, then the balance when it's ready. Mobile money and card both work. You can also pay offline if your designer prefers.",
      placement: "top",
    },
    {
      anchor: "orderDetail.messages",
      title: "Talk to the designer",
      body: "Questions, fabric photos, fitting times. Everything stays in this conversation thread so nothing gets lost.",
      placement: "top",
    },
    {
      anchor: "orderDetail.cancel",
      title: "If something changes",
      body: "Need to cancel? You can up until the designer starts cutting. After that, talk to them first so they can refund what hasn't been spent on materials.",
      placement: "top",
    },
  ],
};
