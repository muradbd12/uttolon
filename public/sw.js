// Minimal service worker: it makes the site installable ("Add to Home screen") and
// deliberately does NOT cache anything, so visitors always get the latest version of
// every page right after a deploy and dashboard data is never served stale.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // no respondWith(): every request goes to the network exactly as before
});
