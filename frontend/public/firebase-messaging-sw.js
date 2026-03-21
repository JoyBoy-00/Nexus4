/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: '__VITE_FIREBASE_API_KEY__',
  authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
  projectId: '__VITE_FIREBASE_PROJECT_ID__',
  storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__VITE_FIREBASE_APP_ID__',
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith('__VITE_FIREBASE_')
);

if (!hasFirebaseConfig) {
  console.warn(
    '[firebase-messaging-sw.js] Firebase config missing. Background push notifications are disabled.'
  );
} else {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message:',
      payload
    );

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'message-notification',
      data: payload.data,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open Chat',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open') {
    // Open the chat page
    const urlToOpen = new URL('/chat', self.location.origin).href;

    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});
