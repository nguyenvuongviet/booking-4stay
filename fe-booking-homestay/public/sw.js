self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "4Stay";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/4stay-logo.png",
    badge: payload.badge || "/4stay-logo.png",
    tag: payload.tag || "4stay-notification",
    renotify: true,
    data: {
      url: payload?.data?.url || "/",
      conversationId: payload?.data?.conversationId,
    },
  };

  const promiseChain = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      const isChatPush = Boolean(options.data.conversationId);

      if (!isChatPush) {
        // Non-chat notification: chặn nếu user đang nhìn vào tab app
        const hasVisibleClient = windowClients.some(
          (client) =>
            client.url.startsWith(self.location.origin) &&
            client.visibilityState === "visible",
        );
        if (hasVisibleClient) return;
      }

      // Chat push hoặc không có tab nào visible → luôn hiển thị
      return self.registration.showNotification(title, options);
    });

  event.waitUntil(promiseChain);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const targetUrl = new URL(url, self.location.origin).href;

        // Ưu tiên focus tab đang mở của app và điều hướng tới URL đích
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        // Không có tab nào mở → mở tab mới
        return self.clients.openWindow(targetUrl);
      }),
  );
});
