
$(document).ready(function() {
    $("#option").click(function() {
        chrome.runtime.openOptionsPage(function() {});
    });

    $("#start").click(function() {
        chrome.tabs.query({
            url: 'https://' + all.option.host + '/*'
        }, function(tabs) {
            //console.log("Query tabs", tabs);
            //console.log('all', all);
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'start'
            }, function(response) {
                console.log("Message received.");
            });
        });
    });
});