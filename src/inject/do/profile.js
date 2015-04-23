
console.log("profile.js");

$(document).ready(function() {
    //window.location.replace("https://" + window.location.host + "/facilities");

    //window.location.replace("https://" + window.location.host + "/facilities/view/activity/293/venue/432?time_from=1429891200");

    window.addEventListener("message", function(event) {
        if (event.origin !== window.location.origin)
            return ;

        //console.log("profile.js receive", event); debugger;

        var all = event.data;

        debugger;
        console.log("jumping to " + all.option.plan[0].getBookUrlSuffix());
        window.location.replace("https://" + window.location.host + all.option.plan[0].getBookUrlSuffix());
    }, false);
});
