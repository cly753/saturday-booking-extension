
console.log("facilities.view.js");

$(document).ready(function() {
    window.confirm = function(msg) { console.log('msg', msg); return false; };
    $("#paynow").click();
});
