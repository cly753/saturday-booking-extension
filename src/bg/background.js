
var track = {
    // 137: 0 // windowId: index
};
var getImageIndex = function(windowId, callback) {
    //chrome.windows.getAll(function(allWindows) {
    //    var used = {};
    //    var newTrack = {};
    //
    //    debugger;
    //    $.each(allWindows, function(i, w) {
    //        if (track[w.id] !== undefined) {
    //            newTrack[w.id] = track[w.id];
    //            used[track[w.id]] = w.id;
    //        }
    //    });
    //
    //    if (newTrack[windowId] === undefined) {
    //        var i = -1;
    //        var find = false;
    //        while (!find) {
    //            i++;
    //            if (used[i] === undefined)
    //                find = true;
    //
    //            if (i > 10) {
    //                console.log("ERROR getImageIndex while loop...");
    //                break;
    //            }
    //        }
    //        newTrack[windowId] = i;
    //    }
    //
    //    track = newTrack;
    //    callback({imageIndex: newTrack[windowId]});
    //});
};

var showIcon = function(tabId, changeInfo, tab) {
    //console.log("tabId", tabId); console.log("changeinfo", changeinfo); console.log("tab", tab);
    console.log("background.js showIcon");
    if (tab.url !== undefined && changeInfo.status === "complete")
        chrome.pageAction.show(tabId);
};

(function() {
    chrome.webNavigation.onCompleted.addListener(function(tab) {
        console.log("chrome.webNavigation.onCompleted tab", tab);
        if (tab.frameId !== 0)
            return ;
    });
    chrome.tabs.onUpdated.addListener(showIcon);
})();

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}