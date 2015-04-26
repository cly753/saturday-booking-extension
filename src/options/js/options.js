
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
    action: ''
};

var saveOptions = function() {
    all.user.username = $("#username").val();
    all.user.password = $("#password").val();
    all.host = $("#host").val();
    //var match = $("#match").val();

    chrome.storage.sync.set({
        all: all
    }, function() {
        console.log('set all', all);
        $("#saveButton").prop('text', 'Save !');
    });
};

var restoreOptions = function() {
    chrome.storage.sync.get({
        all: all
    }, function(store) {
        all = store.all;
        console.log('restore', all);

        $("#username").val(all.user.username);
        $("#password").val(all.user.password);
        $("#host").val(all.host);
    });
};

$(document).ready(function() {
    restoreOptions();
    $("#saveButton").click(saveOptions);
});