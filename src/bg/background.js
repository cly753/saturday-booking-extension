
var options = {
    username: '',
    password: '',
    match: ''
};

var init = function() {
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            chrome.pageAction.show(sender.tab.id);
            sendResponse();
        }
    );
};

chrome.webNavigation.onCompleted.addListener(function(details) {
    init();

    //chrome.tabs.executeScript(details.tabId, {
    //    code: "alert('ok');"
    //});

    chrome.storage.onChanged.addListener(function(changes, area) {
        for (key in changes) {
            options.key = changes[key];
        }
        alert(changes);
        console.log(changes);
    });
});