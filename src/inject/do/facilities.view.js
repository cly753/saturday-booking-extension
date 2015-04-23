
console.log("facilities.view.js");

$(document).ready(function() {

    window.addEventListener("message", function(event) {
        if (event.origin !== window.location.origin)
            return ;

        var all = event.data;
        //console.log("facilities.view.js receive", event); debugger;

        $.each($.grep($("input[name='timeslots[]']"), function(o, i) {
            console.log("grep: " + i, o.value);

            return all.plan[0].match(o.value);
        }, false), function(i, o) {
            console.log("each: " + i, o.value);

            o.checked = true;
        });

        //$("#paynow").click();
    }, false);
});
