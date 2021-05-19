// ==UserScript==
// @name                Force HTTP to HTTPS
// @namespace           kosette
// @version             0.0.1
// @match               http://*.nga.cn/*
// @match               http://*.e-hentai.org/*
// @run-at              document-start
// @description         Force HTTP links to use HTTPS. You need to write your own @match or @include rules!
// ==/UserScript==

document.location.replace(document.location.href.replace(/http\:/, 'https:'));
