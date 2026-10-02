// APP-WO: guarda la pantalla de la app para que abra aunque no haya cobertura.
// Siempre intenta primero la versión nueva de internet; si no hay red, usa la guardada.
var CACHE = 'appwo-v1.3';
var BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];
// Lector de fotos empaquetado: se guarda en el móvil una sola vez para que funcione sin internet
var OCR = ['./ocr/tesseract.min.js', './ocr/worker.min.js', './ocr/tesseract-core-simd-lstm.wasm.js',
  './ocr/tesseract-core-lstm.wasm.js', './ocr/spa.traineddata.gz'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }).then(function () {
    return caches.open(CACHE).then(function (c) {
      return Promise.all(OCR.map(function (u) { return c.match(u).then(function (r) { return r || c.add(u).catch(function () {}); }); }));
    });
  }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copia = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
