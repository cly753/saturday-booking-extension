
var all = $.extend(true, {}, allTemplate);

var inform = function(event) {
    chrome.storage.sync.get({
        all: {}
    }, function(store) {
        var all = store.all;
        all.plan = new Plan(all.plan, all.index);

        console.log('inform event', event);
        var clicked = clicked instanceof Array ? event.target[0] : event.target;

        console.log(ActionReadable[parseInt(clicked.value)] + ' store', all);
        all.action.push(parseInt(clicked.value));

        var tempAll = $.extend(true, {}, all);
        tempAll.plan = all.plan.storeFormat();
        chrome.storage.sync.set({
            all: tempAll
        }, function() {
            console.log(ActionReadable[parseInt(clicked.value)] + ' set');
        });
    });
};

var update = function() {
    $("#status").text(all.action.reduce(function(a, b) { return ActionReadable[a] + ' > ' + ActionReadable[b]; }, ActionReadable.idle));
    $("#openDate").text(all.plan.openDate.format('DD MMMM, YYYY HH:mm:ss'));
};

var clock = function() {
    if (all === undefined || all.plan.openDate === undefined)
        return ;

    var dura = moment.duration(all.plan.openDate.diff(moment()));
    var huma = dura.get('days') + ' days ' + dura.get('hours') + ' hours ' + dura.get('minutes') + ' mins ' + dura.get('seconds') + ' secs';
    $("#timeToGo").text(huma);
};

var saveOptions = function() {
    all.user.username = $("#username").val();
    all.user.password = $("#password").val();

    all.plan.activity = $('#planActivity').find('option:selected').text();
    all.plan.venue = $('#planVenue').find('option:selected').text();
    all.plan.date = moment($("#planDate").val(), 'DD MMMM, YYYY');

    var hourA = parseInt($('#planHourA').find('option:selected').val());
    var hourB = parseInt($('#planHourB').find('option:selected').val());
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
        console.log("page_action.js saveOptions chrome.storage.sync.get", tempAll);
        Materialize.toast('Plan saved!', 1000);
    });
};
var restoreOptions = function() {
    chrome.storage.sync.get({
        all: all
    }, function(store) {
        all = store.all;
        all.plan = new Plan(all.plan, all.index);
        console.log("page_action.js restoreOptions chrome.storage.sync.get", all);

        init();
        update();
    });
};

var init = function() {
    $("#username").val(all.user.username);
    $("#password").val(all.user.password);
    $("#username").change();
    $("#password").change();

    $.each(all.index.activity, function(key, val) {
        if (key !== 'Volleyball')
            return ;
        $('select#planActivity').append($("<option></option>").attr("value", val).text(key));
    });
    $('select#planActivity>option[value="' + all.index.activity[all.plan.activity] + '"]').prop('selected', true);
    $('select#planActivity>option[value="' + all.index.activity[all.plan.activity] + '"]').trigger("change");
    $('select#planActivity').material_select();

    $.each(all.index.venue, function(key, val) {
        $('select#planVenue').append($("<option></option>").attr("value", val).text(key));
    });
    $('select#planVenue>option[value="' + all.index.venue[all.plan.venue] + '"]').prop('selected', true);
    $('select#planVenue>option[value="' + all.index.venue[all.plan.venue] + '"]').trigger("change");
    $('select#planVenue').material_select();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $("#planDate").val(all.plan.date.format('DD MMMM, YYYY'));
    $("#planDate").change();

    for (var h = 7; h < 22; h++) {
        $('select#planHourA').append($("<option></option>").attr("value", h).text((h < 10 ? '0' : '') + h + ':00'));
        $('select#planHourB').append($("<option></option>").attr("value", h).text((h < 10 ? '0' : '') + h + ':00'));
    }
    if (all.plan.hour.length == 2 && all.plan.hour[0] > all.plan.hour[1])
        all.plan.hour[0] = [all.plan.hour[1], all.plan.hour[1] = all.plan.hour[0]][0];
    if (all.plan.hour.length > 0)
        $('select#planHourA').val(all.plan.hour[0] + '');
    if (all.plan.hour.length > 1)
        $('select#planHourB').val(all.plan.hour[1] + '');
    $('select#planHourA').material_select();
    $('select#planHourB').material_select();

    $("#planAdditionalPattern").val(all.plan.additionalPattern);
    $("#planAdditionalPattern").change();

    $.each($(".dropdown-content>li>span"), function(i, s) { $(s).css("font-size", 12); })
};

$(document).ready(function() {
    $("#book").click(inform);
    $("#release").click(inform);
    $("#signIn").click(inform);
    $("#updateIndex").click(inform);
    $("#clearAction").click(inform);

    $("#save").click(saveOptions);
    $("#refresh").click(restoreOptions);

    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("page_action.js chrome.storage.onChanged", changes.all.newValue);
        all = changes.all.newValue;
        all.plan = new Plan(all.plan, all.index);
        update();
    });

    restoreOptions();
    var clockId = setInterval(clock, 1000);
});