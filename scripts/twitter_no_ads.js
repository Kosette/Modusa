// ==UserScript==
// @name twitterNoAds
// @version 1.0
// @author kosette
// @description block twitter ads
// @match *://*.twitter.com/*
// @license MIT
// @grant none
// @namespace kosette.tna
// ==/UserScript==

let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
if (MutationObserver) console.log('No Ads is enabled.');
let observer = new MutationObserver(e => {
    let ads = document.querySelector('div div div article div div[data-testid="tweet"] > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4):not([role="group"]) > div > span')
    if (ads) {
        let line = ads.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        line.setAttribute("style", "display: none;");
        ads = ads.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        ads.remove();
        console.log('Ads have been removed.');
    }
});
observer.observe(document.body, {childList: true, subtree: true});
