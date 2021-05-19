// ==UserScript==
// @name         HuyaNoLogin
// @namespace    kosette.hy
// @version      1.0.0
// @description  虎牙免登陆看高清
// @author       kosette
// @match        *://www.huya.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// ==/UserScript==

(function () {
  localStorage.loginTipsCount = -1e35;
  $(document).ready(function () {
    $("#player-login-tip-wrap").remove();
    VPlayer.prototype.checkLogin(true);
  });
})();
