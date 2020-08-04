self.addEventListener('install', function(evt) {
	console.log('[Service Worker] is being installed.');
//	self.skipWaiting();

	try {
		importScripts("sw-manifest.js");
		console.log('[Service Worker]pre-fetch', self.__precacheManifest);

		// TODO: split ACACHE/DCACHE
		evt.waitUntil(caches.open(ACACHE).then(function(cache) {
			var urls = ['/'];
			self.__precacheManifest.forEach(function (val, idx, arr){
				urls.push(val.url)
			});
			return cache.addAll(urls);
		}));
	} catch (e) {
		// nop
	}
});

var HOST = [
	self.location.host,
	"ocean.taiwan.gov.tw",
	"lvh.me",
	"127.0.0.1",
];

var Cached = [
	[ /sw\.js$/, null], // not cache sw.js

	[ /\.png$/, ACACHE],
	[ /\.css$/, ACACHE],
	[ /\.js$/, ACACHE],
	[ /\.map$/, ACACHE],
	[ /\.jpg$/, ACACHE],
	[ /\.jpeg$/, ACACHE],
	[ /\.svg$/, ACACHE],
	[ /\.woff2$/, ACACHE],
	[ /\.woff$/, ACACHE],
	[ /\.otf$/, ACACHE],
	[ /\.ttf$/, ACACHE],
	[ /\.eot$/, ACACHE],
	[ /^\/favicon\.ico$/, ACACHE],
	[ /^\/$/, ACACHE, 200],
	[ /^\/\?.*$/, ACACHE, 200],


	[ /^\/layers/, DCACHE, 200],
	[ /^\/OpenData/, DCACHE, 200],
	[ /^\/dl\/.*/, DCACHE],
	[ /^\/api\/info/, DCACHE, 200],
	[ /^\/hook\/.*/, DCACHE, -1], // network must fail, then try cache
];

self.addEventListener('fetch', function(evt) {
	//evt.respondWith(fetch(evt.request)); // bypass
	evt.respondWith(cacheOrNonCached(evt.request));
});

function cacheOrNonCached(req) {
	var url = new URL(req.url);
	//var h = url.host;
	var h = url.hostname;
	if(!isCacheHost(h)) {
		return fetch(req); // external resource, not cache
	}
	var p = url.pathname;
	//var s = url.search;
	//console.log('req.url', p);
	for(var i=0; i<Cached.length; i++){
		var cc = Cached[i];
		if(p.match(cc[0])){
			if (!cc[1]) {
				break
			}
			if (!cc[2]) {
				//console.log('cached', p);
				return fromCache(cc[1], req)
			}
			console.log('net-then-cached', p);
			return fromNetwork(cc[1], req, cc[2]).catch(function () {
				return fromCache(cc[1], req)
			})
		}
	}
	console.log('non-cached', p);
	return fetch(req);
}

// Time limited network request. If the network fails or the response is not served before timeout, the promise is rejected.
function fromNetwork(cacheName, req, timeout) {
	return caches.open(cacheName).then(function (cache) {
		if(timeout < 0) {
			return new Promise(function (fulfill, reject) {
				fetch(req).then(function (resp) {
					fulfill(setCache(cache, req, resp)); // Fulfill in case of success (save cache).
				}, reject); // Reject also if network fetch rejects.
			});
		}

		return new Promise(function (fulfill, reject) {
			var timeoutId = setTimeout(reject, timeout); // Reject in case of timeout.
			fetch(req).then(function (resp) {
				clearTimeout(timeoutId);
				fulfill(setCache(cache, req, resp)); // Fulfill in case of success (save cache).
			}, reject); // Reject also if network fetch rejects.
		});
	});
}

function fromCache(cacheName, req) {
	return caches.open(cacheName).then(function (cache) {
		if (req.url.match(/\/\?.*$/)) {  // remove '/?xxxxx...'
			req = '/';
		}
		return cache.match(req).then(function (matching) {
//			return matching || Promise.reject('no-match');
			return matching || fetch(req).then(function (resp) {
				cache.put(req, resp.clone());
				return resp;
			});
		});
	});
}

function setCache(cache, req, resp) {
	if (req.url.match(/\/\?.*$/)) {
		return cache.match('/').then(function (matching) {
			cache.put('/', resp.clone());
			return resp;
		});
	}
	console.log('set-cached', cache, req, resp);
	cache.put(req, resp.clone());
	return resp;
}

function isCacheHost(host) {
	return HOST.indexOf(host) !== -1;
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

