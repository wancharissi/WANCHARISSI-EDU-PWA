/* Offline shell for WANCHARISSI interactive university presentation. */
'use strict';
const CACHE_NAME='wancharissi-edu-pwa-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./pwa-install.js','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('wancharissi-edu-pwa-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Allow the presentation to be hosted in a subfolder. Do not intercept unrelated pages.
  if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put('./index.html',response.clone()).catch(()=>{});}return response}catch(_){return (await caches.match('./index.html'))||Response.error()}})());
    return;
  }
  event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);const cached=await cache.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok)cache.put(request,response.clone()).catch(()=>{});return response}catch(_){return Response.error()}})());
});
