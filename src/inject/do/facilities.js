
console.log("facilities.js");

$(document).ready(function() {

    //$("select[name=activity_filter]").val(293);
    //$("select[name=activity_filter]").trigger("change");
    //
    //$("select[name=venue_filter]").val(249);
    //$("select[name=venue_filter]").trigger("change");

    console.log("facilities.js PHPJS", PHPJS);
    window.postMessage(PHPJS, window.location.origin);

});