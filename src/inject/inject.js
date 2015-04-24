
var all;

var inject = function(src) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(src);
    s.onload = function() {
        //console.log('onload all', all);
        window.postMessage(all, window.location.origin);
        //this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);
};

var loggedIn = function() {
    var text = $("li.mms-nav").find("span.title").text();
    if (text === "My Account")
        return true;
    if (text === "Sign In")
        return false;
    console.log("error loggedIn text", text);
    return false;
};

var signIn = function() {
    $("#email").val(all.option.username);
    $("#password").val(all.option.password);
    $("#btn-submit-login").trigger("click");
};

var toSlot = function() {
    window.location.replace("https://" + all.option.host + all.option.plan[0].bookUrlSuffix);
};

var doSomething = function() {
    var hostRegex = all.option.host.replace(/\./g, "\\.");
    var toInject = [
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\\S*)?$"),
            todo: signIn
            //todo: "src/inject/do/auth.js"
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\\S*)?$"),
            todo: toSlot
            //todo: function() {inject("src/inject/do/profile.js")}
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\\S*)?$"),
            todo:function() {}
            //todo: function() {inject("src/inject/do/facilities.js")}
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\/view\\/activity\\/[0-9]{2,3}\\/venue\\/[0-9]{2,3}\\?time_from=[0-9]+(?:\\?\\S*)?$"),
            todo: function() {}
            //todo: function() {inject("src/inject/do/facilities.view.js")}
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/\\S*$"),
            todo: function() {}
            //todo: function() {inject("src/inject/do/default.js")}
        }
    ];

    var src;
    $.each(toInject, function(i, o) {
        //console.log("each " + i, o);
        //console.log(window.location.href + " vs " + o.url + ", src = " + src);
        if (window.location.href.match(o.url)) {
            src = src || o.todo;
            //console.log("---- match! src = " + src);
        }
    });

    console.log("Function to run", src);
    src();
    //src = "src/inject/do/default.js";
    //return src;
};

(function() {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            console.log("scripts/inject.js receive message", request);
            all = request;
            //debugger;

            doSomething();

            //var s = document.createElement('script');
            //s.src = chrome.extension.getURL(getJs());
            //s.onload = function() {
            //    //console.log('onload all', all);
            //    window.postMessage(all, window.location.origin);
            //    //this.parentNode.removeChild(this);
            //};
            //(document.head||document.documentElement).appendChild(s);

            sendResponse({});
        }
    );
})();

