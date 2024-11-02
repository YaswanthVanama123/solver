// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTGyG65VjkEE18KZJTo4cninZk7p1rEhc",
  authDomain: "your-guider-fbcb0.firebaseapp.com",
  projectId: "your-guider-fbcb0",
  storageBucket: "your-guider-fbcb0.appspot.com",
  messagingSenderId: "544120482529",
  appId: "1:544120482529:web:ee90bf1a01fdef78e325a0",
  measurementId: "G-MSGQ8C42CN"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification.title || 'Notification Title';
  const notificationOptions = {
    body: payload.notification.body || 'Notification Body',
    icon: payload.notification.icon || '/default-icon.png',
    data: {
      user_notification_id: payload.data.user_notification_id // Include user_notification_id in data
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});



// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click Received.');
  event.notification.close();

  const userNotificationId = event.notification.data.user_notification_id; // Access user_notification_id

  // Redirect to /acceptance with user_notification_id parameter
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/acceptance' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(`/acceptance?user_notification_id=${userNotificationId}`);
      }
    })
  );
});
