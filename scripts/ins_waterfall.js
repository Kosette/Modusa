// ==UserScript==
// @name        InsWall
// @namespace   kosette.ins
// @author      kosette
// @description Creates a scrollable wall of full-size images from any user's instagram page. Just click "Load Images" at the top.
// @match       *://*.instagram.com/*
// @exclude     https://www.instagram.com/p/*
// @exclude     https://instagram.com/p/*
// @version     0.1.7
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    // console.log('hi insta scroll');
    // https://www.instagram.com/graphql/query/?query_hash=<hash>&variables={%22shortcode%22:%22<shortcode>%22}

    const IMAGES_PER_QUERY = 15;
    const NTH_TO_LAST_IMAGE = 3;
    const HEIGHT_PCT = .8;
    const WIDTH_PCT = .49;
    const VID_VOLUME = 0.02;
    let m = document.body.innerHTML.match(/profilePage_(\d+)/);
    var userId = m && m[1];
    var notLoaded = true;

    function getQueryHash() {
        let allScripts = Array.from(document.getElementsByTagName('script'));
        let PostPageContainer = allScripts.find(el => el.src && el.src.match(/ProfilePageContainer.js/));
        let ConsumerLibCommons = allScripts.find(el => el.src && el.src.match(/ConsumerLibCommons.js/));
        let Consumer = allScripts.find(el => el.src && el.src.match(/Consumer.js/));

        var query_hash = false,
            query_id = false;

        fetch(ConsumerLibCommons.src)
        .then(resp => {
            console.log('resp 1', resp);
            return resp.text();
        })
        .then(text => {
            let m = text.match(/profilePosts\.byUserId\.get.*?queryId:"([a-f0-9]+)"/); //profilePosts.byUserId.get(n))||void 0===s?void 0:s.pagination},queryId:"e5555555555555555555555555555508"
            console.log('queryId m', m);
            query_id = m && m[1];
            query_id && notLoaded && loadImages(query_id, query_hash);
            // query_id && query_hash && loadImages(query_id, query_hash);
        });

        fetch(PostPageContainer.src)
        .then(resp => {
            console.log('resp 1', resp);
            return resp.text();
        })
        .then(text => {
            let m = text.match(/profilePosts\.byUserId\.get.*?queryId:"([a-f0-9]+)"/); //profilePosts.byUserId.get(n))||void 0===s?void 0:s.pagination},queryId:"e5555555555555555555555555555508"
            console.log('queryId m', m);
            query_id = m && m[1];
            query_id && notLoaded && loadImages(query_id, query_hash);
            // query_id && query_hash && loadImages(query_id, query_hash);
        });

        // l.pagination},queryId:"15b55555555555555555555555555551"
        fetch(Consumer.src)
        .then(resp => {
            console.log('resp 1', resp);
            return resp.text();
        })
        .then(text => {
            //let m = text.match(/l\.pagination\},queryId:"([a-f0-9]+)"/); //const s="05555555555555555555555555555554",E="
            let m = text.match(/profilePosts\.byUserId\.get[^;]+queryId:\s*"([a-f0-9]+)"/);
            console.log('queryId m', m);
            query_id = m && m[1];
            query_id && notLoaded && loadImages(query_id, query_hash);
        });

//         fetch(Consumer.src)
//         .then(resp => {
//             console.log('resp 1', resp);
//             return resp.text();
//         })
//         .then(text => {
//             let m = text.match(/const s="([a-f0-9]+)",E="/); //const s="05555555555555555555555555555554",E="
//             m = m || text.match(/var u="([a-f0-9]+)",s="/);
//             console.log('query_hash m', m);
//             query_hash = m && m[1];
//             query_hash && query_id && loadImages(query_id, query_hash);
//         });
    }

    // https://www.instagram.com/graphql/query/?query_hash=<queryhash>&variables=%7B%22id%22%3A%22<profle_id>%22%2C%22first%22%3A12%2C%22after%22%3A%22<after_code>%3D%3D%22%7D
    function loadImages(query_id, query_hash, after) {
        notLoaded = false;
        console.log('id', query_id, 'hash', query_hash);

        // let userIdMetaTag = document.querySelector('head > meta[property="instapp:owner_user_id"]');
        // let userId = userIdMetaTag && userIdMetaTag.content;
        let m = document.body.innerHTML.match(/profilePage_(\d+)/);
        userId = userId || (m && m[1]);
        if (!userId) return;
        let queryVariables = {"id": userId, "first": IMAGES_PER_QUERY};
        if (after) queryVariables.after = after;
        let queryVariablesString = encodeURIComponent(JSON.stringify(queryVariables));
        let imageListQueryUrl = `https://www.instagram.com/graphql/query/?query_hash=${query_id}&variables=${queryVariablesString}`;

        fetch(imageListQueryUrl, { responseType: 'json' })
        .then(resp => {
            console.log('resp 1', resp);
            return resp.json();
        })
        .then(json => {
            console.log('json', json);

            let timelineMedia = json.data.user.edge_owner_to_timeline_media;
            let end_cursor = timelineMedia.page_info.end_cursor;
            let mediaList = timelineMedia.edges.map(n => n.node);
            console.log('media list', mediaList);

            let bigContainer = document.querySelector('#igBigContainer');
            // Create the main container if it doesn't exist
            if (!bigContainer) {
                let tempDiv = document.createElement('div');
                tempDiv.innerHTML = `<div id="igBigContainer" style="background-color: #112;width: 100%;height: 100%;z-index: 999;position: fixed;top: 0;left: 0;overflow: scroll;">
                    <div id="igAllImages" style="display:block; text-align:center;"></div></div>`;
                bigContainer = tempDiv.firstElementChild;
                document.body.innerHTML = '';
                document.body.appendChild(bigContainer);

                let imgStyle = document.createElement('style');
                imgStyle.type = 'text/css';
                setMaxSize(imgStyle);
                document.body.appendChild(imgStyle);
                window.addEventListener('resize', evt => setMaxSize(imgStyle));
                styleIt();
            }
            let innerContainer = bigContainer.firstElementChild;

            for (let media of mediaList) {
                addMedia(media, innerContainer);
            }

            if (end_cursor) {
                console.log('end_cursor', end_cursor);
                let triggerImage = document.querySelector('#igAllImages a:nth-last-of-type(3)');
                bigContainer.onscroll = (evt) => {
                    let vh = document.documentElement.clientHeight || window.innerHeight || 0;
                    if (triggerImage.getBoundingClientRect().top - 800 < vh) {
                        bigContainer.onscroll = null;
                        console.log('loading next set of images');
                        loadImages(query_id, query_hash, end_cursor);
                    }

                }
            }
        });
    }

    function getBestImage(media) {
        return media.display_resources.reduce((a, b) => a.width > b.width ? a : b).src;
    }

    function addMedia(media, container) {
        let shortcode = media.shortcode;
        let medias = media.edge_sidecar_to_children ? media.edge_sidecar_to_children.edges.map(n => n.node) : [ media ];
        for (let m of medias) {
            let a = document.createElement('a');
            a.href = `https://www.instagram.com/p/${shortcode}/`;
            if (m.is_video) {
                let vid = document.createElement('video');
                vid.src = m.video_url;
                vid.controls = true;
                vid.volume = VID_VOLUME;
                a.textContent = 'Link';
                container.appendChild(vid);
                container.appendChild(a);
            } else {
                a.innerHTML += `<img src="${getBestImage(m)}">`;
                container.appendChild(a);
            }
        }
    }

    function setMaxSize(userStyle) {
        let vw = document.documentElement.clientWidth || window.innerWidth || 0;
        let vh = document.documentElement.clientHeight || window.innerHeight || 0;
        userStyle.innerHTML = `
#igAllImages img, #igAllImages video {
  max-height: ${vh * HEIGHT_PCT}px;
  max-width: ${vw * WIDTH_PCT}px;
}
`;
    }

    function styleIt() {
        let userStyle = document.createElement('style');
        userStyle.type = 'text/css';
        userStyle.innerHTML = `
#igAllImages video {
  border: green solid 2px;
`;
        document.body.appendChild(userStyle);
    }

    function startUp() {
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<div style="margin: 20px;font-size: 18px;font-weight: regular;color: #3897F0; cursor: pointer;"><h2>Load Images</h2></div>`;
        let loadButton = tempDiv.firstElementChild;
        loadButton.onclick = getQueryHash;

        (function insertButton() {
            let insAt = document.querySelector('.ZcHy5, ._47KiJ');
            if (insAt) {
                insAt.parentNode.insertBefore(loadButton, insAt);
            } else {
                window.setTimeout(insertButton, 20);
            }
        })();
    }
    startUp();

})();