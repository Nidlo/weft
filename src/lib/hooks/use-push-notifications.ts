"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/lib/firebase";
import { REGISTER_FCM_TOKEN } from "@/lib/graphql/mutations/notification";
import { useNotificationsStore } from "@/lib/stores/notifications";
import type { RegisterFcmTokenData } from "@/types/graphql";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function usePushNotifications(enabled: boolean) {
  const [registerToken] = useMutation<RegisterFcmTokenData>(REGISTER_FCM_TOKEN);
  const incrementUnread = useNotificationsStore((s) => s.incrementUnread);
  const registered = useRef(false);

  useEffect(() => {
    if (!enabled || registered.current) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!VAPID_KEY) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    async function requestPermissionAndRegister() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const token = await getToken(messaging!, { vapidKey: VAPID_KEY });
        if (!token) return;

        await registerToken({ variables: { token } });
        registered.current = true;
      } catch {
        // Permission denied or FCM unavailable — silently fail
      }
    }

    requestPermissionAndRegister();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title) {
        toast(title, { description: body });
      }
      incrementUnread();
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, registerToken, incrementUnread]);
}
