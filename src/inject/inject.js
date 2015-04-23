
var all;

var host = window.location.hostname;
var url = window.location.href;

var getJs = function() {
    var hostRegex = host.replace(/\./g, "\\.");
    var toInject = [
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\S*)?$"),
            js: "src/inject/do/auth.js"
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\S*)?$"),
            js: "src/inject/do/profile.js"
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\S*)?$"),
            js: "src/inject/do/facilities.js"
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\/view\\/activity\\/[0-9]{3}\\/venue\\/[0-9]{3}\\?time_from=[0-9]+$"),
            js: "src/inject/do/facilities.view.js"
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "(?:\\/\S*)?$"),
            js: "src/inject/do/default.js"
        }
    ];

    var src;
    $.each(toInject, function(i, o) {
        //console.log("each " + i, o);
        //console.log(url + " vs " + o.url + ", src = " + src);
        if (url.match(o.url)) {
            src = src || o.js;
            //console.log("---- match! src = " + src);
        }
    });

    console.log("Script to execute: " + src);

    //src = "src/inject/do/default.js";
    return src;
};

var getActivityId = function() {

    console.log(PHPJS.activity_list);
};

var getVenueId = function() {

};

var checkLoggedIn = function() {
    return false;
};

(function() {
    chrome.extension.sendMessage({}, function(response) {
        console.log("Hello. This message was sent from scripts/inject.js");
        console.log("Receive", response);
        all = response;

        console.log("inject all", all);

        var s = document.createElement('script');
        s.src = chrome.extension.getURL(getJs());
        s.onload = function() {
            window.postMessage(all, window.location.origin);
            //this.parentNode.removeChild(this);
        };
        (document.head||document.documentElement).appendChild(s);
    });
})();

