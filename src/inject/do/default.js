
console.log("Here is default.js... Some error?");

$(document).ready(function() {

    //chrome.extension.sendMessage({}, function(response) {
    //    console.log("Hello. This message was sent from do/default.js");
    //});


    console.log(PHPJS.activity_list);

    alert("ready " + PHPJS.activity_list);

    window.postMessage({hello: 'world'}, '*');
});