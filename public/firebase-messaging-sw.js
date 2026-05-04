//
// Firebase Cloud Messaging service worker.
//
// Service workers don't get Next.js env injection, so the page that
// registers this SW must pass the FCM config via query string:
//
//   navigator.serviceWorker.register(
//     `/firebase-messaging-sw.js?apiKey=${k}&projectId=${p}` +
//       `&messagingSenderId=${s}&appId=${a}`
//   );
//
// If any required field is missing (current state — FCM is schema-only
// in private beta), the SW exits without initializing Firebase. That
// avoids the previous footgun where placeholder values silently
// initialized Firebase and then dropped every push payload (audit
// FE-FIREBASE-SW). Once the FCM beta wiring lands, populate the env
// vars and re-register the SW.

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

const isConfigured = Object.values(config).every(
  (v) => typeof v === "string" && v.length > 0
);

if (isConfigured) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    const actionUrl = payload.data?.click_action || "/notifications";

    if (title) {
      self.registration.showNotification(title, {
        body: body || "",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        data: { url: actionUrl },
      });
    }
  });
} else {
  // Intentional no-op: don't fake-init with placeholder values. The
  // notificationclick handler below still works for any pushes that
  // somehow get registered; everything else is dormant until a real
  // FCM config is supplied at registration time.
  console.warn(
    "[firebase-messaging-sw] no FCM config in registration URL — push disabled"
  );
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
