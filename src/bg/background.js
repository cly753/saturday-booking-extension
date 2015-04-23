
var all = {
    option: {
        username: '',
        password: '',
        plan: [

        ]
    },
    id: {
        activity: {

        },
        venue: {

        }
    }
};

var initMessage = function() {
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("request", request);
            console.log("sender", sender);
            console.log("sendResponse", sendResponse);

            console.log("background all", all);
            sendResponse(all);
        }
    );
};

var initOptions = function() {
    chrome.storage.onChanged.addListener(function(changes, area) {
        console.log("chrome.storage.onChanged", changes);
        for (var key in changes) {
            all.option[key] = changes[key].newValue;
        }
    });

    chrome.storage.sync.get({
        username: '',
        password: '',
        plan: []
    }, function(store) {
        all.option.username = store.username;
        all.option.password = store.password;
        //all.option.plan = store.plan;
        all.option.plan = [
            new Plan({
                priority: 0,
                activity: "Volleyball",
                venue: "MOE (Evans) Sports Hall",
                date: moment("2015-04-30"),
                hour: [
                    17,
                    18
                ]
                //self.priority = p.priority;
                //self.activity = p.activity;
                //self.venue = p.venue;
                //self.date = p.date;
                //self.hour = p.hour;
            })
        ];
    });

};

var showIcon = function(tabId, changeInfo, tab) {
    //console.log("tabId", tabId);
    //console.log("changeinfo.status", changeinfo.status);
    //console.log("tab.url", tab.url);
    if (tab.url === undefined || changeInfo.status !== "complete")
        return ;
    chrome.pageAction.show(tabId);
};

chrome.webNavigation.onCompleted.addListener(function(tab) {
    //console.log("tab", tab);
    if (tab.frameId !== 0)
        return ;

    initOptions();
    initMessage();
    chrome.tabs.onUpdated.addListener(showIcon);
});

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}