self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "4Stay";

  const promiseChain = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      let isUserActivelyChatting = false;

      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        // Nếu user đang mở trang inbox, tab đang hiển thị (visible) và được focus
        if (
          clientUrl.pathname === "/inbox" &&
          client.visibilityState === "visible" &&
          client.focused
        ) {
          isUserActivelyChatting = true;
          break;
        }
      }

      if (isUserActivelyChatting) {
        console.log(
          "[SW] User đang mở trang chat và active, không hiển thị push.",
        );
        return;
      }

      return self.registration.showNotification(title, options);
    });

  event.waitUntil(promiseChain);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/inbox";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const targetUrl = new URL(url, self.location.origin).href;
        for (const client of clients) {
          if (
            "focus" in client &&
            client.url.startsWith(self.location.origin)
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
