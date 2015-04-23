
var options = {
    username: '',
    password: '',
    match: ''
};

var initMessage = function() {
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("request", request);
            console.log("sender", sender);
            console.log("sendResponse", sendResponse);

            chrome.pageAction.show(sender.tab.id);
            sendResponse();
        }
    );
};

var initOptions = function() {
    chrome.storage.sync.get({
        username: '',
        password: '',
        match: ''
    }, function(store) {
        options.username = store.username;
        options.password = store.password;
        options.match = store.match;
    });

    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("chrome.storage.onChanged", changes);
        for (key in changes) {
            options[key] = changes[key].newValue;
        }
    });
};

var showIcon = function(tabId, changeInfo, tab) {
    //console.log("tabId", tabId);
    //console.log("changeinfo.status", changeinfo.status);
    //console.log("tab.url", tab.url);
    if (tab.url === undefined || changeinfo.status !== "complete")
        return ;
    chrome.pageAction.show(tabId);
};

chrome.webNavigation.onCompleted.addListener(function(tab) {
    //console.log("tab", tab);
    if (tab.frameId !== 0)
        return ;

    chrome.tabs.onUpdated.addListener(showIcon);

    initMessage();
    initOptions();
});

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}