
console.log("facilities.js");

$(document).ready(function() {
    console.log("facilities.js PHPJS", PHPJS);
    window.postMessage(PHPJS, window.location.origin);
});