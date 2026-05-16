import type { TourDefinition } from "../types";

/**
 * Plain ASCII only (Q-13). The identity section is shared by clients and
 * designers; shop/studio sections only render for designers, so the tour
 * sticks to anchors every account has.
 */
export const PROFILE_EDIT_TOUR: TourDefinition = {
  id: "profileEdit",
  label: "Edit profile",
  steps: [
    {
      anchor: "profileEdit.header",
      title: "Make it yours",
      body: "This is where you keep your details current. Changes save as you go, so there is no submit button to hunt for.",
      placement: "bottom",
    },
    {
      anchor: "profileEdit.avatar",
      title: "Add a photo",
      body: "Tap the picture to upload an avatar. A real face helps designers and clients recognise who they are working with.",
      placement: "bottom",
    },
    {
      anchor: "profileEdit.identity",
      title: "Your name and contact",
      body: "Keep your name, city, and contact details accurate here. Designers use this to reach you about your orders.",
      placement: "top",
    },
  ],
};
