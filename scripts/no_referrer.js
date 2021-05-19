// ==UserScript==
// @name             noReferrer
// @version          0.1
// @namespace        kosette.nr
// @description      purge referrer for specific domains
// @match            *://*.inoreader.com/*
// @match            *://*.gravatar.com/*
// @grant none
// ==/UserScript==
var meta = document.createElement('meta');
meta.name = "referrer";
meta.content = "no-referrer";
document.getElementsByTagName('head')[0].appendChild(meta);
