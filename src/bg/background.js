
var beforeRequest = function(details) {
    console.log('background.js beforeRequest dropping details', details);
    return {
        cancel: (details.type === 'image' || details.url.indexOf('google-analytics.com') != -1) ? true : false
    }; // BlockingResponse
};

var showIcon = function(tabId, changeInfo, tab) {
    //console.log("tabId", tabId); console.log("changeinfo", changeinfo); console.log("tab", tab);
    console.log("background.js showIcon tab", tab);
    if (tab.url !== undefined && changeInfo.status === "complete")
        if (tab.url.indexOf(HOST) !== -1)
    {
        chrome.pageAction.show(tabId);

        chrome.webRequest.onBeforeRequest.addListener(beforeRequest, {
            urls: [
                '*://*.google-analytics.com/*',
                '*://' + HOST_2 + '/*',
                '*://' + HOST + '/*'
            ],
            //types: [
            //    //"image"
            //],
            tabId: tabId
            //windowId: -1
        }, [
            'blocking'
        ]);
        chrome.webRequest.handlerBehaviorChanged(function() {
            console.log('background.js chrome.webRequest.handlerBehaviorChanged');
        });
    }
};

(function() {
    chrome.tabs.onUpdated.addListener(showIcon);
})();

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}