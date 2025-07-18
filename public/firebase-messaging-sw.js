importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyB45STI_1RRWKaHzmDq8BK8FHNtHdatJ_M",
  authDomain: "alfredo-renovations.firebaseapp.com",
  projectId: "alfredo-renovations",
  storageBucket: "alfredo-renovations.firebasestorage.app",
  messagingSenderId: "23761058114",
  appId: "1:23761058114:web:cd8784e574f34dd93bb0db",
  measurementId: "G-61YTDMDZX2",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.data?.title ?? "New Notification";
  const notificationOptions = {
    body: payload.data?.body ?? "New message received",
    icon: "/icon-512.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
