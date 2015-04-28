
var host = '';

var showIcon = function(tabId, changeInfo, tab) {
    //console.log("tabId", tabId); console.log("changeinfo", changeinfo); console.log("tab", tab);
    console.log("background.js showIcon tab", tab);
    if (tab.url !== undefined && tab.url.indexOf(host) !== -1 && changeInfo.status === "complete")
        chrome.pageAction.show(tabId);
};

(function() {
    //chrome.webNavigation.onCompleted.addListener(function(tab) {
    //    //console.log("chrome.webNavigation.onCompleted tab", tab);
    //    if (tab.frameId !== 0)
    //        return ;
    //});

    chrome.storage.sync.get({
        all: {}
    }, function(store) {
        console.log("background.js load chrome.storage.sync.get", store);
        host = store.all.host;
    });
    chrome.tabs.onUpdated.addListener(showIcon);
})();

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}