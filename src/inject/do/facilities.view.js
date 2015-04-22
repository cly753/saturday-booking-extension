
console.log("facilities.view.js");

var jo = function() {

    $.each($.grep($("input[name='timeslots[]']"), function(o, i) {
        console.log("grep: " + i, o.value);

        if (o.value.indexOf("15:00:00;16:00:00") != -1)
            return true;
        return false;
    }, false), function(i, o) {
        console.log("each: " + i, o.value);

        o.checked = true;
    });

    //$("#paynow").click();
};

$(document).ready(jo);
