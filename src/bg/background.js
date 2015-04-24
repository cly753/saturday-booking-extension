
var all = {
    option: {
        username: '',
        password: '',
        host: '',
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

var sent = false;

var sendMessage = function() {
    //if (sent)
    //    return ;
    sent = true;

    console.log("sendMessage");

    chrome.tabs.query({
        url: 'https://' + all.option.host + '/*'
    }, function(tabs) {
        //console.log("Query tabs", tabs);
        //console.log('all', all);
        chrome.tabs.sendMessage(tabs[0].id, all, function(response) {
            console.log("Message received.");
        });
    });
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
        host: '',
        plan: []
    }, function(store) {
        console.log("chrome.storage.sync.get", store);

        all.option.username = store.username;
        all.option.password = store.password;
        all.option.host = store.host;
        //all.option.plan = store.plan;
        all.option.plan = [
            new Plan({
                priority: 0,
                activity: "Volleyball",
                venue: "MOE (Evans) Outdoor Facilities",
                date: moment("2015-04-26"),
                hour: [
                    16,
                    17
                ]
                //self.priority = p.priority;
                //self.activity = p.activity;
                //self.venue = p.venue;
                //self.date = p.date;
                //self.hour = p.hour;
            })
        ];

        sendMessage();
    });
};

var showIcon = function(tabId, changeInfo, tab) {
    console.log("showIcon");
    //console.log("tabId", tabId);
    //console.log("changeinfo.status", changeinfo.status);
    //console.log("tab.url", tab.url);
    if (tab.url === undefined || changeInfo.status !== "complete")
        return ;
    chrome.pageAction.show(tabId);
};

chrome.webNavigation.onCompleted.addListener(function(tab) {
    console.log("chrome.webNavigation.onCompleted");
    //console.log("tab", tab);
    if (tab.frameId !== 0)
        return ;

    initOptions();
    chrome.tabs.onUpdated.addListener(showIcon);
});

//, {
//    url: [{
//        urlPrefix : 'https://www.facebook.com/'
//    }]
//}