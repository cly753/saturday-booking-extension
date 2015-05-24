var all = $.extend(true, {}, allTemplate);

var hostRegex = HOST.replace(/\./g, "\\.");
var reg = {
    auth: new RegExp("^https:\\/\\/" + hostRegex + "\\/auth(?:\\?\\S*)?$"),

    profile: new RegExp("^https:\\/\\/" + hostRegex + "\\/profile(?:\\?\\S*)?$"),

    facilities : new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities(?:\\?\\S*)?$"),

    facilitiesQuick : new RegExp("^https:\\/\\/" + hostRegex + "\\/facilities\\//quick-booking(?:\\?\\S*)?$"),

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
        all.plan = new Plan(all.plan, all.index);

        if (callback !== undefined) callback();
    });
};

var popPush = function(name, will) {
    var actionRemoved = all.action.pop();
    console.log('inject.js popPush action to remove', ActionReadable[actionRemoved]);

    if (will !== undefined)
        all.action.push(will);

    save(function() {
        //console.log(name + ' popped');
    });
};

var checkSignIn = function() {
    var text = $("li.mms-nav").find("span.title").text();
    if (text !== "My Account") {
        console.log('text: ' + text + ' (Not signed in. Going to sign in...)');
        all.action.push(Action.signIn);
        save();
        return true;
    }
    return false;
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

    var target = "https://" + HOST + "/auth";

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

    var target = "https://" + HOST + "/facilities";
    if (window.location.href !== target) {
        window.location.replace(target);
        return ;
    }

    //$("select[name=activity_filter]").val(293);
    //$("select[name=activity_filter]").trigger("change");
    //$("select[name=venue_filter]").val(249);
    //$("select[name=venue_filter]").trigger("change");

    window.addEventListener("message", function(event) {
        if (event.origin !== 'https://' + HOST)
            return ;
        var PHPJS = event.data;
        console.log('inject.js updateIndex PHPJS', PHPJS);

        for (var i in PHPJS.activity_list)
            all.index.activity[PHPJS.activity_list[i].name] = PHPJS.activity_list[i].activity_id;

        var activityIndex = all.index.activity[all.plan.activity];
        var url = 'https://' + HOST + '/ajax/getVenues/' + (activityIndex !== undefined ? activityIndex : all.index.activity.Volleyball);
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

    inject('/src/inject/do/facilities.js', function() {
        popPush(ActionReadable.updateIndex);
    });
};

var wait = function(timeAllow, timeWait) {
    if (all.plan.openDate.diff(moment()) > timeAllow) {
        console.log('It\'s not the time, going to sleep...');
        setTimeout(function () { if (all.action[all.action.length - 1] === Action.book) window.location.reload() }, timeWait);
        return true;
    }
    return false;
};
var book = function() {
    console.log(ActionReadable.book);

    if (wait(60000, 40000)) return ;

    if (checkSignIn()) return ;

    var target = "https://" + HOST + all.plan.bookUrlSuffix;
    console.log('book target', target);
    if (window.location.href !== target && window.location.href.match(reg.facilitiesQuick) === null) {
        window.location.replace(target);
        return;
    }

    if (window.location.href === target) {
        if (wait(5000, 3000)) return ;

        if ($(".subvenue-slot").length === 0) {
            if (all.plan.openDate.diff(moment()) < -15000) {
                console.log('[ERROR] time reached but no slot found.');
                popPush(ActionReadable.book);
                return;
            }
            console.log('It\'s not the time, going to sleep...');
            setTimeout(function () {
                if (all.action[all.action.length - 1] === Action.book) window.location.reload()
            }, 100);
            return;
        }

        var quota = 2;
        $.each($("input[name='timeslots[]']"), function (i, o) {
            //console.log("each " + i, o);
            var yes = false;
            $.each(all.plan.pattern, function (i, p) {
                yes = yes || (-1 !== o.value.toLowerCase().indexOf(p) && -1 !== o.value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase()));
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
        if (quota !== 2) {
            window.addEventListener("message", function (event) {
                console.log('receive message event', event);
                if (event.origin !== 'https://' + HOST)
                    return;
                if (event.data.action !== 'book')
                    return ;
                console.log('captured msg', event.data.msg);
                popPush(ActionReadable.book, Action.release);
            }, false);
            inject('/src/inject/do/facilities.view.js');
        }
        else {
            console.log('[WARNING] no slot selected...');
            popPush(ActionReadable.book);
        }
    }
    else {
        $("select[name=activity_filter]").val(all.index.activity[all.plan.activity]);
        $("select[name=activity_filter]").trigger("change");
        $("select[name=venue_filter]").val(all.index.venue[all.plan.venue]);
        $("select[name=venue_filter]").trigger("change");

        $(".btn-filter-search").click();

        //$.post('https://members.myactivesg.com/facilities/processStandardBooking/a026eb1a0e3ecfa4748c1fe8cc29859d', {
        //    'activity_id': '293',
        //    'venue_id': '249',
        //    'chosen_date': '2015-05-31',
        //    '2df2adff810116083a6b4cc450901085': 'a016c1703dd50c6e8541213c171c1936e71ecf24bea8913af1f283ecf5e6803b',
        //    'timeslots[]': ['Basketball Court 2;3141;139985;09:00:00;10:00:00'],
        //    'cart': 'ADD TO CART',
        //    'fdscv': '0XX0Z'
        //}).done(function(data) {
        //    console.log('done data', data);
        //});

        $.get('https://' + HOST + '/facilities/ajax/getTimeslots',
            {
                activity_id: all.index.activity[all.plan.activity],
                venue_id: all.index.venue[all.plan.venue],
                date: all.plan.date.format('yyyy-MM-DD'),
                time_from: all.plan.date.unix()
            },
            function(data) {
                console.log('getTimeslots data', data);
                var bookForm = $.parseHTML(data);

                var values = [];
                var quota = 2;
                $.each(bookForm, function(i, o) {
                    $.each($('input[name="timeslots[]"]', o), function(ii, oo) {
                        var yes = false;
                        var value = oo.value;
                        $.each(all.plan.pattern, function (iii, p) {
                            yes = yes || (-1 !== value.toLowerCase().indexOf(p) && -1 !== value.toLowerCase().indexOf(all.plan.additionalPattern.toLowerCase()));
                        });

                        if (yes) {
                            if (quota > 0)
                                values.push(value);
                            else
                                console.log('too many matches... ', oo);
                            quota--;
                        }
                    });
                });

                payload = {
                    'activity_id': all.index.activity[all.plan.activity],
                    'venue_id': all.index.venue[all.plan.venue],
                    'chosen_date': all.plan.date.format('yyyy-MM-DD'),
                    //'2df2adff810116083a6b4cc450901085': 'a016c1703dd50c6e8541213c171c1936e71ecf24bea8913af1f283ecf5e6803b',
                    //'timeslots[]': ['Basketball Court 2;3141;139985;09:00:00;10:00:00'],
                    'timeslots[]': values,
                    'cart': 'ADD TO CART',
                    'fdscv': '0XX0Z'
                };
                payload[bookForm[0].name] = bookForm[0].value;

                $.post('https://members.myactivesg.com/facilities/processStandardBooking/a026eb1a0e3ecfa4748c1fe8cc29859d',
                    payload
                ).done(function(data) {
                    console.log('done data', data);
                });
            }
        );
    }
};

var release = function() {
    console.log(ActionReadable.release);

    var target = "https://" + HOST + "/cart";
    if (window.location.href !== target) { window.location.replace(target); return ; }

    if (checkSignIn()) return ;

    var timeLeft = $.map($("#cartTimer").text().split(':'), function(o, i) { return parseInt(o, 10); });

    var rebookMilli = (Math.max(0, timeLeft[0] - 1) * 60 + timeLeft[1]) * 1000;
    console.log('Re-book after ' + (timeLeft[0] - 1) + ' minutes ' + timeLeft[1] + ' seconds... (' + rebookMilli + ' milliseconds) timeLeft', timeLeft);
    setTimeout(function() {
        if (all.action[all.action.length - 1] !== Action.release)
            return ;
        window.addEventListener("message", function(event) {
            console.log('receive message event', event);

            if (event.origin !== 'https://' + HOST) return ;
            if (event.data.action !== 'release') return ;

            console.log('captured msg', event.data.msg);
            popPush(ActionReadable.release, Action.book);
        }, false);
        inject('/src/inject/do/cart.js');
    }, rebookMilli);
     //}, 10 * 1000);
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
            //console.log('topAction: undefined, do nothing.');
            break;
        default:
            all.action.pop();
            popPush('ERROR invalid action.');
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

