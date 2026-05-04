"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { firebaseConfig, getFirebaseMessaging } from "@/lib/firebase";
import { REGISTER_FCM_TOKEN } from "@/lib/graphql/mutations/notification";
import { MY_NOTIFICATION_PREFERENCES } from "@/lib/graphql/queries/notification";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { isInQuietHours } from "@/lib/utils/quiet-hours";
import type {
  MyNotificationPreferencesData,
  RegisterFcmTokenData,
} from "@/types/graphql";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const PUSH_CHANNEL_NAME = "nidlo:push:dedupe";
// Cap the dedupe set so it doesn't grow unbounded over a long session.
const DEDUPE_MAX = 200;
// localStorage flag so we never re-prompt after the user explicitly chose.
const PROMPT_FLAG = "nidlo:push:prompted";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

function readPermissionState(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as PushPermissionState;
}

async function registerForPushImpl(
  registerToken: (vars: { variables: { token: string } }) => Promise<unknown>,
): Promise<void> {
  if (typeof window === "undefined" || !VAPID_KEY) return;
  const messaging = getFirebaseMessaging();
  if (!messaging) return;
  try {
    const swRegistration = await registerServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    if (!token) return;
    await registerToken({ variables: { token } });
  } catch {
    // FCM unavailable — silently fail
  }
}

/**
 * Lightweight companion hook for surfaces that need the prompt UI but
 * MUST NOT mount a second `onMessage` listener (RealtimeProvider already
 * owns the singleton listener).
 */
export function usePushPermission() {
  const [registerToken] = useMutation<RegisterFcmTokenData>(REGISTER_FCM_TOKEN);
  const [permission, setPermission] = useState<PushPermissionState>("default");

  useEffect(() => {
    setPermission(readPermissionState());
  }, []);

  const requestPermission = useCallback(async (): Promise<PushPermissionState> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    try {
      const result = (await Notification.requestPermission()) as PushPermissionState;
      setPermission(result);
      try {
        localStorage.setItem(PROMPT_FLAG, "1");
      } catch {
        // Storage may be unavailable in private mode — non-fatal.
      }
      if (result === "granted") {
        await registerForPushImpl(registerToken);
      }
      return result;
    } catch {
      return readPermissionState();
    }
  }, [registerToken]);

  const shouldPromptUi =
    permission === "default" &&
    typeof window !== "undefined" &&
    !!VAPID_KEY &&
    (() => {
      try {
        return localStorage.getItem(PROMPT_FLAG) !== "1";
      } catch {
        return true;
      }
    })();

  return { permission, shouldPromptUi, requestPermission };
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) return undefined;

  // Pass the Firebase config as query params so the SW can initialize
  // Firebase Messaging for background push handling (see public/firebase-messaging-sw.js).
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? "",
    projectId: firebaseConfig.projectId ?? "",
    messagingSenderId: firebaseConfig.messagingSenderId ?? "",
    appId: firebaseConfig.appId ?? "",
  });

  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
  );
}

/**
 * Owned by `RealtimeProvider`. This hook is the sole owner of the
 * `onMessage` foreground listener and the BroadcastChannel dedupe. Surfaces
 * that need to drive the permission prompt should use `usePushPermission`.
 */
export function usePushNotifications(enabled: boolean) {
  const [registerToken] = useMutation<RegisterFcmTokenData>(REGISTER_FCM_TOKEN);
  const incrementUnread = useNotificationsStore((s) => s.incrementUnread);
  const registered = useRef(false);

  // Read quiet-hours from cache so we can suppress in-app toasts during the
  // user's window. Backend `BE-NIDLO-NOTIF-06` exposes the values; the prefs
  // page also writes via `updateQuietHours`. `cache-first` is fine because the
  // mutation refetches the query.
  const { data: prefsData } = useQuery<MyNotificationPreferencesData>(
    MY_NOTIFICATION_PREFERENCES,
    { skip: !enabled, fetchPolicy: "cache-first" },
  );
  const quietHoursStart =
    prefsData?.myNotificationPreferences?.quietHoursStart ?? null;
  const quietHoursEnd =
    prefsData?.myNotificationPreferences?.quietHoursEnd ?? null;

  // If the user already granted permission in a prior session, register the
  // device token silently — no prompt UI needed.
  useEffect(() => {
    if (!enabled || registered.current) return;
    if (readPermissionState() !== "granted") return;
    registered.current = true;
    registerForPushImpl(registerToken);
  }, [enabled, registerToken]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!VAPID_KEY) return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    // Cross-tab dedupe: when a foreground push arrives, broadcast its id so
    // sibling tabs skip showing the same toast / double-incrementing the
    // unread badge. The set caps to DEDUPE_MAX entries (FIFO) to bound memory.
    const handled = new Set<string>();
    const remember = (id: string) => {
      handled.add(id);
      if (handled.size > DEDUPE_MAX) {
        const first = handled.values().next().value;
        if (first !== undefined) handled.delete(first);
      }
    };

    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(PUSH_CHANNEL_NAME)
        : null;

    if (channel) {
      channel.onmessage = (e: MessageEvent<{ id?: string }>) => {
        if (e.data?.id) remember(e.data.id);
      };
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      const id = payload.messageId ?? null;
      if (id && handled.has(id)) return;
      if (id) {
        remember(id);
        channel?.postMessage({ id });
      }

      // Honor user's quiet hours: still increment the unread badge so the
      // notification surfaces on next open, but don't fire a toast that would
      // pop on screen / emit a system sound during the quiet window.
      const quiet = isInQuietHours(quietHoursStart, quietHoursEnd);
      const { title, body } = payload.notification ?? {};
      if (title && !quiet) {
        toast(title, { description: body });
      }
      incrementUnread();
    });

    return () => {
      unsubscribe();
      channel?.close();
    };
  }, [enabled, incrementUnread, quietHoursStart, quietHoursEnd]);
}
