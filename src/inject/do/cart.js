
console.log("cart.js");

$(document).ready(function() {
    window.alert = function(msg) { console.log('alert msg', msg); };
    $.each($('.deleteFacility'), function(i, o) {
        console.log('i = ' + i + ', o', o);
        o.click();
    });
});
