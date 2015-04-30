
console.log("cart.js");

$(document).ready(function() {
    var toDelete = $('.deleteFacility');
    var done = toDelete.length;
    window.alert = function(msg) {
        console.log('alert msg', msg);

        done--;
        if (done === 0) {
            window.postMessage({
                action: 'release',
                msg: msg
            }, window.location.origin);
            delete window.alert;
        }
    };
    $.each(toDelete, function(i, o) {
        console.log('i = ' + i + ', o', o);
        o.click();
    });

    //$.ajax({
    //    url: window.location.origin + '/cart/ajax/expired',
    //    method: 'POST',
    //    dataType: 'json',
    //    complete: function(jqXHR, textStatus) {
    //        console.log('jqXHR', jqXHR);
    //        console.log('textStatus', textStatus);
    //        window.postMessage({
    //            action: 'release',
    //            msg: 'ok'
    //        }, window.location.origin);
    //    }
    //});
});
