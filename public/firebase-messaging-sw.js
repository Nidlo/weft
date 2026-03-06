/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

// Firebase config is injected during service worker registration
// For now, use a minimal config — the sw only needs messagingSenderId
firebase.initializeApp({
  apiKey: "placeholder",
  projectId: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder",
});

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
