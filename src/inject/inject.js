var getJs = function() {
    var host = window.location.hostname;
    var hostRegex = host.replace(/\./g, "\\.");
    var url = window.location.href;
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
        console.log(url + " vs " + o.url + ", src = " + src);
        if (url.match(o.url)) {
            src = src || o.js;
            console.log("---- match! src = " + src);
        }
    });

    console.log("Script to execute: " + src);

    src = "src/do/default.js";
    return src;
};

var getActivityId = function() {
    //if (window.location.href !== "https://members.myactivesg.com/facilities")
    //    window.location.replace("https://members.myactivesg.com/facilities");

    console.log(PHPJS.activity_list);
}

var getVenueId = function() {

}

var jo = function() {
    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event)
    {
        if (event.origin !== "http://example.org:8080")
            return;

        // ...
    }

    chrome.extension.sendMessage({}, function(response) {
        console.log("Hello. This message was sent from scripts/inject.js");
    });

    var s = document.createElement('script');
    s.src = chrome.extension.getURL(getJs());
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);
};

jo();


