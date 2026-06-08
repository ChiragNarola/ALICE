importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCs3yySm4ZFDFFwqvzA1dnQU4SA-KUgEFs",
  authDomain: "alice-50768.firebaseapp.com",
  projectId: "alice-50768",
  storageBucket: "alice-50768.firebasestorage.app",
  messagingSenderId: "525322096225",
  appId: "1:525322096225:web:4b8be95389f96e39932420",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  const question = payload.data?.question ?? "";
  const is_editable = payload.data?.is_editable === "true" || payload.data?.is_editable === "1"
    ? "true"
    : "false";

  // ← close any existing notification with same tag before showing new one
  self.registration.getNotifications({ tag: "alice-notification" }).then((notifications) => {
    notifications.forEach(n => n.close());
    
    self.registration.showNotification(title, {
      body,
      icon: "/logo.svg",
      tag: "alice-notification",
      renotify: false, // ← don't notify again if same tag exists
      data: { question, is_editable },
    });
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { question, is_editable } = event.notification.data ?? {};

  let url = "/";
  if (question) {
    // Save for after login
    // Can't access sessionStorage from SW, so pass via URL to login
    url = `/login?redirect_question=${encodeURIComponent(question)}&redirect_auto=${is_editable}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});