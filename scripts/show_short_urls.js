// ==UserScript==
// @name         Hover to Show Redirect URL
// @namespace    kosette.redirect
// @version      1.0
// @description  Show redirect URL when hovering over a link that redirects
// @author       Kosette
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // create div element for displaying redirect URL
    let hoverDiv = document.createElement('div');
    hoverDiv.style.position = 'absolute';
    hoverDiv.style.top = '0';
    hoverDiv.style.left = '0';
    hoverDiv.style.padding = '5px';
    hoverDiv.style.border = '1px solid black';
    hoverDiv.style.backgroundColor = 'white';
    hoverDiv.style.display = 'none';
    document.body.appendChild(hoverDiv);

    // add event listener to all links on the page
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseover', () => {
            // check if link redirects
            fetch(link.href, {method: 'HEAD'}).then(response => {
                const location = response.headers.get('location');
                if (location !== null) {
                    hoverDiv.textContent = location;
                    hoverDiv.style.display = 'block';
                }
            }).catch(() => {});
        });
        link.addEventListener('mouseout', () => {
            hoverDiv.style.display = 'none';
        });
    });
})();
