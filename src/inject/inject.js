var all = {
    option: {
        username: '',
        password: '',
        host: '',
        plan: []
    },
    id: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    },
    action: ''
};

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

var updateIndex = function() {

};

var isSignedIn = function() {
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

var book = function() {
    all.action = undefined;

    var quota = 2;
    $.each($.grep($("input[name='timeslots[]']"), function(o, i) {
        console.log("grep: " + i, o.value);

        return match(o.value, all.option.plan[0]);
    }, false), function(i, o) {
        console.log("each: " + i, o.value);

        if (quota > 0)
            o.checked = true;
        quota--;
    });

    //$("#paynow").click();
}

var doSomething = function() {
    var hostRegex = all.option.host.replace(/\./g, "\\.");
    var toInject = [
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\\S*)?$"),
            todo: signIn
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\\S*)?$"),
            todo: function() {}
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\\S*)?$"),
            todo: updateIndex
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\/view\\/activity\\/[0-9]{2,3}\\/venue\\/[0-9]{2,3}\\?time_from=[0-9]+(?:\\?\\S*)?$"),
            todo: all.action == undefined ? function() {} : book
        },
        {
            url: new RegExp("^https:\\/\\/" + hostRegex + "\\/\\S*$"),
            todo: function() {}
        }
    ];

    var dodo;
    $.each(toInject, function(i, o) {
        //console.log("each " + i, o);
        //console.log(window.location.href + " vs " + o.url + ", src = " + src);
        if (window.location.href.match(o.url)) {
            dodo = dodo || o.todo;
            //console.log("---- match! src = " + src);
        }
    });

    console.log("Function to run", dodo);
    dodo();
};

(function() {
    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("inject chrome.storage.onChanged", changes);
        for (var key in changes)
            all = key;

        doSomething();
    });

    chrome.storage.sync.get({
        all: all
    }, function(store) {
        console.log("chrome.storage.sync.get", store);

        all = store.all;
        console.log("inject all", all);

        if (all === undefined)
            return;

        all.option.plan = [
            new Plan({
                priority: 0,
                activity: "Volleyball",
                venue: "MOE (Evans) Outdoor Facilities",
                date: moment("2015-04-26"),
                hour: [
                    16,
                    17
                ]
            })
        ];

        doSomething();
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('request', request);
        console.log('sender', sender);
        console.log('sendResponse', sendResponse);

        if (request.action !== undefined)
            all.action = request.action;
        doSomething();
        sendResponse({});
    });
})();

