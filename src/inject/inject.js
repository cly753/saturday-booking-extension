var all = {
    user: {
        username: '',
        password: ''
    },
    plan: {},
    host: '',
    index: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    },
    action: []
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
    console.log('.....: inject');

    var s = document.createElement('script');
    s.src = chrome.extension.getURL(src);
    s.onload = function() {
        //console.log('onload all', all);
        window.postMessage(all, window.location.origin);
        //this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);
};

var save = function(callback) {
    var tempAll = $.extend(true, {}, all);
    tempAll.plan = all.plan.storeFormat();
    chrome.storage.sync.set({
        all: tempAll
    }, function() {
        if (callback !== undefined) callback();
    });
};
var load = function(callback) {
    chrome.storage.sync.get({
        all: all
    }, function(store) {
        console.log("inject.js restore chrome.storage.sync.get", store);
        all = store.all;
        //all.plan.activity = "Volleyball";
        //all.plan.venue = "MOE (Evans) Outdoor Facilities";
        all.plan = new Plan(all.plan);

        if (callback !== undefined) callback();
    });
};

var popPush = function(name, will) {
    var actionRemoved = all.action.pop();
    console.log('inject.js popPush actionRemoved', actionRemoved);

    if (will !== undefined)
        all.action.push(will);

    save(function() { console.log(name + ' popped'); });
};

var signIn = function() {
    console.log('action: signIn');

    var text = $("li.mms-nav").find("span.title").text();
    console.log('signIn text', text);

    if (text === "My Account") {
        console.log('Already signed in.');
        popPush('signIn');
        return ;
    }

    if (text !== "Sign In")
        console.log("error loggedIn text", text);

    var target = "https://" + all.host + "/auth";

    console.log('href', window.location.href);
    console.log('reg.auth', reg.auth);
    if (window.location.href.match(reg.auth) == null) {
        window.location.replace(target);
        return ;
    }

    $("#email").val(all.user.username);
    $("#password").val(all.user.password);
    $("#btn-submit-login").trigger("click");
};

var updateIndex = function() {
    console.log('action: updateIndex');

    var target = "https://" + all.host + "/facilities";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    // ...

    popPush('updateIndex');
};

var book = function() {
    console.log('action: book');

    if (all.plan.openDate.diff(moment()) > 30000) {
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() {window.location.reload()}, 15000);
        return ;
    }

    var text = $("li.mms-nav").find("span.title").text();
    if (text !== "My Account") {
        console.log('text: ' + text + ' (Not signed in. Going to sign in...)');
        all.action.push('signIn');
        save();
        return ;
    }

    var target = "https://" + all.host + all.plan.bookUrlSuffix;
    console.log('book target', target);
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    if (all.plan.openDate.diff(moment()) > 5000) {
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() {window.location.reload()}, 3000);
        return ;
    }

    if ($(".subvenue-slot").length === 0) {
        if (all.plan.openDate.diff(moment()) < -5000) {
            console.log('[ERROR] time reached but no slot found.');
            popPush('book');
            return ;
        }
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() {window.location.reload()}, 100);
        return ;
    }

    var quota = 2;
    $.each($("input[name='timeslots[]']"), function(i, o) {
        //console.log("each " + i, o);

        var yes = false;
        $.each(all.plan.pattern, function(i, p) {
            yes = yes || (-1 !== o.value.toLowerCase().indexOf(p) && -1 !== o.value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase()));
            //console.log('matching... i: ' + i + ', addi: ' + all.plan.additionalPattern + ', pattern', p);
            //console.log('result', (-1 !== o.value.toLowerCase().indexOf(p) && -1 !== o.value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase())));
        });

        o.checked = false;
        if (yes) {
            if (quota > 0)
                o.checked = true;
            else
                console.log('too many matches... ', o);
            quota--;
        }
    });

    if (quota !== 0)
        console.log('WARNING not exactly matched! quota', quota);

    $("#paynow").click();
    popPush('book');
};

var release = function() {
    console.log('action: release');

    var target = "https://" + all.host + "/cart";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    // ...

    popPush('release');
};

var doSomething = function() {
    console.log('doSomething action', all);

    var topAction = all.action.pop(); if (topAction !== undefined) all.action.push(topAction);
    switch (topAction) {
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
        case 'clearAction':
            all.action = [];
            popPush('clearAction');
            break;
        case undefined:
            console.log('topAction: undefined, do nothing.');
            break;
        default:
            console.log('ERROR invalid action.');
            break;
    }
};

(function() {
    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("inject chrome.storage.onChanged", changes);
        for (var key in changes)
            all = changes[key].newValue;
        all.plan = new Plan(all.plan);
        doSomething();
    });

    load(doSomething);

    //chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //    console.log('request', request);
    //    console.log('sender', sender);
    //    console.log('sendResponse', sendResponse);
    //
    //    if (request.action !== undefined)
    //          all.action.push(request.action);
    //    doSomething();
    //    sendResponse({});
    //});
})();

