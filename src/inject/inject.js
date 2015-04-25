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

var conf = {
    image: [
        {
            user: {
                username: '',
                password: ''
            },
            plan: [],
            action: ''
        }
    ],
    host: '',
    id: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    }
};

var hostRegex = window.location.host.replace(/\./g, "\\.");
var reg = {
    auth: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\\S*)?$"),

    profile: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\\S*)?$"),

    facilities : new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\\S*)?$"),

    book: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\/view\\/activity\\/[0-9]{2,3}\\/venue\\/[0-9]{2,3}\\?time_from=[0-9]+(?:\\?\\S*)?$"),

    release: new RegExp("^https:\\/\\/" + hostRegex + "\\/cart(?:\\?\\S*)?$"),

    idle: new RegExp("^https:\\/\\/" + hostRegex + "\\/\\S*$")
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

var resetAndDo = function(name, todo) {
    all.action = '';
    chrome.storage.sync.set({
        all: all
    }, function() {
        console.log(name + ' reset todo', todo);
        if (todo !== undefined)
            todo();
    });
};

var signIn = function() {
    var text = $("li.mms-nav").find("span.title").text();
    console.log('signIn text', text);

    if (text === "My Account") {
        resetAndDo('signIn', function() {console.log('Already signed in.');});
        return ;
    }

    if (text !== "Sign In")
        console.log("error loggedIn text", text);

    var target = "https://" + all.option.host + "/auth";

    console.log('href', window.location.href);
    console.log('reg.auth', reg.auth);
    if (window.location.href.match(reg.auth) == null) {
        window.location.replace(target);
        return ;
    }

    $("#email").val(all.option.username);
    $("#password").val(all.option.password);

    resetAndDo('signIn', function() {
        $("#btn-submit-login").trigger("click");
    });
};

var updateIndex = function() {
    var target = "https://" + all.option.host + "/facilities";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    // ...

    resetAndDo('updateIndex');
};

var book = function() {
    var target = "https://" + all.option.host + all.option.plan[0].bookUrlSuffix;
    console.log('book target', target);
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    var quota = 2;
    $.each($.grep($("input[name='timeslots[]']"), function(o, i) {
        //console.log("grep " + i, o.value);

        var yes = false;
        $.each(all.option.plan[0].hour, function(i, h) {
            var guess = h + ":00:00;" + (h + 1) + ":00:00";
            yes = yes || o.value.indexOf(guess) != -1;
        });
        return yes;
    }, false), function(i, o) {
        //console.log("each: " + i, o.value);

        if (quota > 0)
            o.checked = true;
        else
            console.log('too many matches...');
        quota--;
    });

    resetAndDo('book', function() {
        //$("#paynow").click();
    });
};

var release = function() {
    var target = "https://" + all.option.host + "/cart";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    // ...

    resetAndDo('release');
};

var doSomething = function() {
    console.log('doSomething action', all);

    switch (all.action) {
        case 'book':
            book();
            break;
        case 'signIn':
            signIn();
            break;
        case 'updateIndex':
            updateIndex();
            break;
        case 'release':
            release();
            break;
        case '':
            console.log('do nothing.');
            break;
    }
};

(function() {
    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("inject chrome.storage.onChanged", changes);
        for (var key in changes)
            all = changes[key].newValue;
        doSomething();
    });

    chrome.storage.sync.get({
        all: all
    }, function(store) {
        console.log("chrome.storage.sync.get", store);
        all = store.all;

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

    //chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //    console.log('request', request);
    //    console.log('sender', sender);
    //    console.log('sendResponse', sendResponse);
    //
    //    if (request.action !== undefined)
    //        all.action = request.action;
    //    doSomething();
    //    sendResponse({});
    //});
})();

