// ==UserScript==
// @name         RemoveParameters
// @namespace    kosette.rp
// @version      1.0.0
// @description  Remove Redundant URL Search Parameters
// @author       kosette
// @exclude      https://*.google.com/*
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    console.log(GM_info.script.name + " is loading.");;
    let TotalReplaceUri = location.href.split("?")[0];
    let FirstSearchParameter = location.search.split('&')[0];
    let PartialReplaceUri = TotalReplaceUri + FirstSearchParameter;
    let keywords = ["fbclid", "jobsource", "from=fb", "f=cs", "gclid", "utm_", "from=udn"];

    keywords.forEach(element => {
        if (location.href.includes(element)) {
            ModifyUrl(TotalReplaceUri);
        }
    });

    if (PartialReplaceUri.includes("fbclid") && !FirstSearchParameter.includes("fbclid")) {
        ModifyUrl(PartialReplaceUri);
    }

    function ModifyUrl(replaceUri) {
        // 修改網址，且不留下歷史紀錄
        window.history.replaceState({},
            window.title,
            replaceUri
        );
    }
    console.log(GM_info.script.name + " is running.");
})(document);
