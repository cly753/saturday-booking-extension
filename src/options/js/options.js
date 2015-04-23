var saveOptions = function() {
    var username = $("#username").val();
    var password = $("#password").val();
    var match = $("#match").val();

    console.log("username", username);
    chrome.storage.sync.set({
        username: username,
        password: password,
        match: match
    }, function() {
        $("#saveButton").prop('value', 'Save !');
    });
};

var restoreOptions = function() {
    chrome.storage.sync.get({
        username: '',
        password: '',
        match: ''
    }, function(store) {
        $("#username").val(store.username);
        $("#password").val(store.password);
        $("#match").val(store.match);
    });
};

$(document).ready(function() {
    restoreOptions();
    $("#saveButton").click(saveOptions);
});