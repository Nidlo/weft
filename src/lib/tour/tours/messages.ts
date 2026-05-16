import type { TourDefinition } from "../types";

/** Plain ASCII only (Q-13). */
export const MESSAGES_TOUR: TourDefinition = {
  id: "messages",
  label: "Messages",
  steps: [
    {
      anchor: "messages.header",
      title: "Talk to your designer",
      body: "Every order has its own conversation. This is where you agree on details, share references, and sort out changes.",
      placement: "bottom",
    },
    {
      anchor: "messages.list",
      title: "Your conversations",
      body: "Threads show up here once an order is underway. Tap one to open it. New messages bump it to the top with an unread count.",
      placement: "top",
    },
  ],
};
