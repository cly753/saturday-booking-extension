
var all = {
    user: {
        username: '',
        password: ''
    },
    plan: {
        activity: '',
        venue: '',
        date: '',
        hour: [],
        additionalPattern: ''
    },
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

var inform = function(event) {
    chrome.storage.sync.get({
        all: {}
    }, function(store) {
        var all = store.all;
        all.plan = new Plan(all.plan);

        console.log(ActionReadable[event.target.value] + ' store', all);
        all.action.push(parseInt(event.target.value));

        var tempAll = $.extend(true, {}, all);
        tempAll.plan = all.plan.storeFormat();
        chrome.storage.sync.set({
            all: tempAll
        }, function() {
            console.log(ActionReadable[event.target.value] + ' set');
        });
    });
};

var update = function() {
    $("#username").val(all.user.username);
    $("#password").val(all.user.password);
    $("#host").val(all.host);

    $("#planActivity").val(all.plan.activity);
    $("#planVenue").val(all.plan.venue);
    $("#planDate").val(all.plan.date.format());
    if (all.plan.hour.length > 0)
        $("#planHourA").val(all.plan.hour[0] + '');
    if (all.plan.hour.length > 1)
        $("#planHourB").val(all.plan.hour[1] + '');
    $("#planAdditionalPattern").val(all.plan.additionalPattern);

    $("#status").text(all.action.reduce(function(a, b) { return ActionReadable[a] + ' > ' + ActionReadable[b]; }, '-'));
    $("#targetDate").text(all.plan.date.format());
    $("#openDate").text(all.plan.openDate.format());
};
var clock = function() {
    $("#currentTime").text(moment().format());

    if (all !== undefined && all.plan.openDate !== undefined) {
        var dura = moment.duration(all.plan.openDate.diff(moment()));
        var huma = dura.get('days') + ' days ' + dura.get('hours') + ' hours ' + dura.get('minutes') + ' minutes ' + dura.get('seconds') + ' seconds';
        $("#timeToGo").text(huma);
        $("#timeToGoAbout").text(dura.humanize(true));
    }

    setTimeout(function() {
        clock();
    }, 1000);
};

var saveOptions = function() {
    all.user.username = $("#username").val();
    all.user.password = $("#password").val();
    all.host = $("#host").val();

    all.plan.activity = $("#planActivity").val();
    all.plan.venue = $("#planVenue").val();
    all.plan.date = moment($("#planDate").val());

    var hourA = parseInt($("#planHourA option:selected").val());
    var hourB = parseInt($("#planHourB option:selected").val());
    all.plan.hour = [];
    if (hourA !== -1)
        all.plan.hour.push(hourA);
    if (hourB !== -1 && hourA != hourB)
        all.plan.hour.push(hourB);

    all.plan.additionalPattern = $("#planAdditionalPattern").val();

    var tempAll = $.extend(true, {}, all);
    tempAll.plan = all.plan.storeFormat();
    chrome.storage.sync.set({
        all: tempAll
    }, function() {
        console.log("page_action saveOptions chrome.storage.sync.get", tempAll);
    });
};
var restoreOptions = function() {
    chrome.storage.sync.get({
        all: all
    }, function(store) {
        all = store.all;
        all.plan = new Plan(all.plan);
        console.log("page_action restoreOptions chrome.storage.sync.get", all);

        update();
    });
};

var init = function() {
    var hours = [];
    for (var i = 7; i < 22; i++)
        hours.push(i);

    $.each(hours, function(i, h) {
        $('#planHourA').append($("<option></option>").attr("value", h).text((h < 10 ? '0' : '') + h + ':00'));
        $('#planHourB').append($("<option></option>").attr("value", h).text((h < 10 ? '0' : '') + h + ':00'));
    });
};

$(document).ready(function() {
    $("#book").click(inform);
    $("#signIn").click(inform);
    $("#clearAction").click(inform);

    $("#save").click(saveOptions);
    $("#refresh").click(restoreOptions);

    init();

    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("page_action chrome.storage.onChanged", changes);
        for (var key in changes)
            all = changes[key].newValue;

        all.plan = new Plan(all.plan);
        update();
    });

    restoreOptions();
    clock();
});