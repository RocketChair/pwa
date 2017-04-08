if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(() => {
      console.log('ServiceWorker Registered')
    });
} else {
  console.error('ServiceWorkers not supported');
}
