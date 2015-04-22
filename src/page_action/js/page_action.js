
$(document).ready(function() {
    $("#buttonToOption").click(function() {
        chrome.runtime.openOptionsPage(function() {
            // do nothing
        });
    });
});