
// list for app assets
var assets = null;

self.addEventListener('install', function(evt) {
	console.log('[Service Worker] is being installed.');
//	self.skipWaiting();

	try {
		importScripts("sw-manifest.js");
		console.log('[Service Worker]pre-fetch', self.__precacheManifest);

		evt.waitUntil(caches.open(ACACHE).then(function(cache) {
			var urls = ['/'];
			self.__precacheManifest.forEach(function (val, idx, arr){
				urls.push(val.url);
			});
			cache.put('.assets', new Response(JSON.stringify(urls)));
			assets = urls;
			return cache.addAll(urls);
		}));
	} catch (e) {
		// nop
	}
});

self.addEventListener('fetch', async function(evt) {
	var req = evt.request;
	evt.respondWith(assetsFromCache(req));
	//evt.respondWith(fetch(req)); // bypass
});

async function assetsFromCache(req) {
	var cache = await caches.open(ACACHE);
	if(!assets) {
		var listJson = await cache.match('.assets');
		assets = JSON.parse(listJson);
	}

	if (req.url.match(/\/\?.*$/)) {  // remove '/?xxxxx...'
		req = '/';
	}
	var resp = await cache.match(req) || fetch(req);
	return resp;
}

self.addEventListener('activate', function(ev) {
	const aCache = ACACHE;
	const dCache = DCACHE;
	ev.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if ((aCache != cacheName) && (dCache != cacheName)) {
						console.log('Deleting out of date cache:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

