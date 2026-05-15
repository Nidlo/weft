import type { TourDefinition } from "../types";

// The new-order flow is a 7-step wizard. Anchors here all live on
// step 0 of the wizard - the goal is orientation (where am I, how do
// I move through this), not annotating every field on every step.
export const NEW_ORDER_TOUR: TourDefinition = {
  id: "newOrder",
  label: "Creating an order",
  steps: [
    {
      anchor: "newOrder.header",
      title: "Build your blueprint",
      body: "This wizard walks you through everything a designer needs to start cutting. Take your time, you can go back and edit anything before you submit.",
      placement: "bottom",
    },
    {
      anchor: "newOrder.stepper",
      title: "Your progress",
      body: "Each chip is a step. The copper line fills as you move forward. Garment, design, fabric, fit, budget, then a review. About two minutes total.",
      placement: "bottom",
    },
    {
      anchor: "newOrder.fields",
      title: "Fill in each step",
      body: "Pick what you want made and the occasion. Be specific, the more detail the designer gets, the closer the first sample will be to what's in your head.",
      placement: "top",
    },
    {
      anchor: "newOrder.continue",
      title: "Move forward",
      body: "Tap Continue when the step is ready. You can always come back with the Back button. The final step is a review before anything is sent.",
      placement: "top",
    },
  ],
};
