self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback to cache if network fails (optional, for offline support)
        // For now, just re-throw the error or return a custom response
        return new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      })
  );
});
