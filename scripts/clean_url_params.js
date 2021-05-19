// ==UserScript==
// @name         去除地址栏URL参数
// @namespace    Kosette
// @version      0.0.1
// @description  去除URL中不必要的参数
// @author       Motoori Kashin, Kosette
// @include      http*://*.bilibili.com/*
// @include      http*://pan.baidu.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 参数可自行添加
    let word = ["spm_id_from", "from_source", "msource", "bsource", "seid", "from", "source", "session_id", "visit_id", "sourceFrom", "_at_"];
    let url = [];

    let handle = {
        relink(link) {
            let last = link.split('?');
            let search = [];
            if (last[1]) {
                let dot = "";
                if (last[1].match("#")) {
                    dot = last[1].split('#')[1];
                    last[1] = last[1].split('#')[0];
                }
                search = last[1].split('&');
                for (let i = 0; i < search.length; i++){
                    let key = search[i].split('=');
                    if (word.includes(key[0])) search[i] = "";
                }
                search = search.filter((e) => e);
                last[1] = search.join("&");
                last = last.filter((e) => e);
                link = last.join("?");
                if (dot) link = link + "#" + dot;
            }
            link = link[link.length - 1] == "/" ? link.substring(0, link.length - 1) : link;
            return link;
        },
        link(){
            let links = document.getElementsByTagName("a");
            url[1] = window.location.href;
            if (url[0] != url[1]) {
                window.history.replaceState(null, null, handle.relink(url[1]));
            }
            for (let i = 0; i < links.length; i++){
                if (links[i].href) links[i].href = handle.relink(links[i].href);
            }
        }
    }
    url[0] = window.location.href;
    window.history.replaceState(null, null, handle.relink(url[0]));
    setTimeout(()=>{window.onclick = () => handle.link()},1000)
})();