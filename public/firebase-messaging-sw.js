importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  const question = payload.data?.question ?? "";
  const is_editable = payload.data?.is_editable ?? "false";

  self.registration.showNotification(title, {
    body,
    icon: "/logo.svg",
    tag: "alice-notification",
    data: { question, is_editable: isAuto },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { question, is_editable } = event.notification.data ?? {};

  let url = "/chat";
  if (question) {
    url = `/chat?question=${encodeURIComponent(question)}&auto=${is_editable}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/chat") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});