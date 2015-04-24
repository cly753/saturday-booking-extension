var saveOptions = function() {
    var username = $("#username").val();
    var password = $("#password").val();
    var host = $("#host").val();
    //var match = $("#match").val();

    console.log("username", username);
    chrome.storage.sync.set({
        username: username,
        password: password,
        host: host
        //match: match
    }, function() {
        $("#saveButton").prop('value', 'Save !');
    });
};

var restoreOptions = function() {
    chrome.storage.sync.get({
        username: '',
        password: '',
        host: '',
        plan: []
    }, function(store) {
        $("#username").val(store.username);
        $("#password").val(store.password);
        $("#host").val(store.host);
        //$("#match").val(store.plan);
    });
};

$(document).ready(function() {
    restoreOptions();
    $("#saveButton").click(saveOptions);
});