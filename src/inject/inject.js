var all = $.extend(true, {}, allTemplate);

var hostRegex = window.location.host.replace(/\./g, "\\.");
var reg = {
    auth: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\\S*)?$"),

    profile: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\\S*)?$"),

    facilities : new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\\S*)?$"),

    book: new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\/view\\/activity\\/[0-9]{2,3}\\/venue\\/[0-9]{2,3}\\?time_from=[0-9]+(?:\\?\\S*)?$"),

    release: new RegExp("^https:\\/\\/" + hostRegex + "\\/cart(?:\\?\\S*)?$"),

    idle: new RegExp("^https:\\/\\/" + hostRegex + "\\/\\S*$")
};

var inject = function(src, callback) {
    console.log('.....: inject src', src);

    var s = document.createElement('script');
    s.src = chrome.extension.getURL(src);
    if (callback !== undefined)
        s.onload = callback;
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
        console.log("inject.js load chrome.storage.sync.get", store);
        all = store.all;
        //all.plan.activity = "Volleyball";
        //all.plan.venue = "MOE (Evans) Outdoor Facilities";
        all.plan = new Plan(all.plan, all.index);

        if (callback !== undefined) callback();
    });
};

var popPush = function(name, will) {
    var actionRemoved = all.action.pop();
    console.log('inject.js popPush action to remove', ActionReadable[actionRemoved]);

    if (will !== undefined)
        all.action.push(will);

    save(function() { console.log(name + ' popped'); });
};

var signIn = function() {
    console.log(ActionReadable.signIn);

    var text = $("li.mms-nav").find("span.title").text();
    console.log('text', text);

    if (text === "My Account") {
        console.log('Already signed in.');
        popPush(ActionReadable.signIn);
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
    console.log(ActionReadable.updateIndex);

    var target = "https://" + all.host + "/facilities";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    //$("select[name=activity_filter]").val(293);
    //$("select[name=activity_filter]").trigger("change");
    //$("select[name=venue_filter]").val(249);
    //$("select[name=venue_filter]").trigger("change");

    window.addEventListener("message", function(event) {
        if (event.origin !== 'https://' + all.host)
            return ;
        var PHPJS = event.data;
        console.log('inject.js updateIndex PHPJS', PHPJS);

        for (var i in PHPJS.activity_list)
            all.index.activity[PHPJS.activity_list[i].name] = PHPJS.activity_list[i].activity_id;

        var activityIndex = all.index.activity[all.plan.activity];
        var url = 'https://' + all.host + '/ajax/getVenues/' + (activityIndex !== undefined ? activityIndex : all.index.activity.Volleyball);
        console.log('requesting url', url);
        $.ajax({
            method: 'GET',
            url: url,
            cache: false,
            success: function(data, textStatus, jqXHR) {
                console.log('$.ajax.data');
                console.log('data', data);
                console.log('textStatus', textStatus);
                console.log('jqXHR', jqXHR);

                all.index.venue = {};
                for (var i in data.venues)
                    all.index.venue[data.venues[i].name] = data.venues[i].venue_id;

                console.log('inject.js all', all);
                save();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('[ERROR] $.ajax.error');
                console.log('[ERROR] jqXHR', jqXHR);
                console.log('[ERROR] textStatus', textStatus);
                console.log('[ERROR] errorThrown', errorThrown);
            }
        });
    }, false);

    inject('/src/inject/do/facilities.js');

    popPush(ActionReadable.updateIndex);
};

var book = function() {
    console.log(ActionReadable.book);

    if (all.plan.openDate.diff(moment()) > 60000) {
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() { if (all.action.length > 0) window.location.reload()}, 40000);
        return ;
    }

    var target = "https://" + all.host + all.plan.bookUrlSuffix;
    console.log('book target', target);
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    var text = $("li.mms-nav").find("span.title").text();
    if (text !== "My Account") {
        console.log('text: ' + text + ' (Not signed in. Going to sign in...)');
        all.action.push(Action.signIn);
        save();
        return ;
    }

    if (all.plan.openDate.diff(moment()) > 5000) {
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() { if (all.action.length > 0) window.location.reload()}, 3000);
        return ;
    }

    if ($(".subvenue-slot").length === 0) {
        if (all.plan.openDate.diff(moment()) < -3000) {
            console.log('[ERROR] time reached but no slot found.');
            popPush(ActionReadable.book);
            return ;
        }
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function() { if (all.action.length > 0) window.location.reload()}, 300);
        return ;
    }

    var quota = 2;
    $.each($("input[name='timeslots[]']"), function(i, o) {
        //console.log("each " + i, o);
        var yes = false;
        $.each(all.plan.pattern, function(i, p) {
            yes = yes || (-1 !== o.value.toLowerCase().indexOf(p) && -1 !== o.value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase()));
            //console.log('matching... i: ' + i + ', addi: ' + all.plan.additionalPattern + ', pattern', p); console.log('result', (-1 !== o.value.toLowerCase().indexOf(p) && -1 !== o.value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase())));
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
        console.log('[WARNING] not exactly matched! quota', quota);
    if (quota !== 2)
        inject('/src/inject/do/facilities.view.js', function() {
            setTimeout(function() {
                popPush(ActionReadable.book, Action.release)
            }, 1000);
        });
    else {
        console.log('[WARNING] no slot selected...');
        popPush(ActionReadable.book);
    }
};

var release = function() {
    console.log(ActionReadable.release);

    var target = "https://" + all.host + "/cart";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    //if (all.plan.openDate.add(7, 's').unix() < moment().unix()) {
    //    setTimeout(function() { if (all.action.length > 0) window.location.reload()}, 60 * 1000);
    //    return ;
    //}

    inject('/src/inject/do/cart.js', function() {
        setTimeout(function() {
            popPush(ActionReadable.release, Action.book);
        }, 1000);
    });
};

var doSomething = function() {
    //console.log('doSomething action', all);

    var topAction = all.action.pop(); if (topAction !== undefined) all.action.push(topAction);
    switch (topAction) {
        case Action.book:
            book();
            break;
        case Action.signIn:
            signIn();
            break;
        case Action.updateIndex:
            updateIndex();
            break;
        case Action.release:
            release();
            break;
        case Action.clear:
            all.action = [];
            popPush(ActionReadable.clear);
            break;
        case Action.idle:
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
        console.log("inject.js chrome.storage.onChanged", changes.all.newValue);
        all = changes.all.newValue;
        all.plan = new Plan(all.plan, all.index);
        doSomething();
    });

    load(doSomething);
})();

