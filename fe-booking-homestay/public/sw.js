self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "4Stay";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/4stay-logo.png",
    badge: payload.badge || "/4stay-logo.png",
    tag: payload.tag || "4stay-notification",
    data: {
      url: payload?.data?.url || "/",
      conversationId: payload?.data?.conversationId,
    },
  };

  const promiseChain = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      const isChatPush = Boolean(options.data.conversationId);
      const hasAnyAppClient = windowClients.some((client) =>
        client.url.startsWith(self.location.origin),
      );
      const hasVisibleClient = windowClients.some((client) => {
        return (
          client.url.startsWith(self.location.origin) &&
          client.visibilityState === "visible"
        );
      });

      if (isChatPush && hasAnyAppClient) {
        return;
      }

      if (!isChatPush && hasVisibleClient) {
        return;
      }

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
        for (const client of clients) {
          if ("focus" in client && client.url.startsWith(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
