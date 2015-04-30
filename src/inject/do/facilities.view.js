
console.log("facilities.view.js");

$(document).ready(function() {
    window.confirm = function(msg) {
        console.log('msg', msg);

        window.postMessage({
            action: 'book',
            msg: msg
        }, window.location.origin);

        delete window.confirm;
        return false;
    };
    $("#paynow").click();
});
