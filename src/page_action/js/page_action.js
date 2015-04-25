
var conf = {
    image: [
        {
            user: {
                username: '',
                password: ''
            },
            plan: [],
            action: '',
            using: false
        }
    ],
    host: '',
    id: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    }
};

$(document).ready(function() {
    $("#option").click(function() {
        chrome.runtime.openOptionsPage(function() {});
    });

    $("#book").click(function() {
        chrome.storage.sync.get({
            all: {}
        }, function(store) {
            var all = store.all;
            console.log('book restore', all);
            all.action = 'book';
            chrome.storage.sync.set({
                all: all
            }, function() {
                console.log('book set');
            });
        });
    });

    $("#signIn").click(function() {
        chrome.storage.sync.get({
            all: {}
        }, function(store) {
            var all = store.all;
            console.log('signIn restore', all);
            all.action = 'signIn';
            chrome.storage.sync.set({
                all: all
            }, function() {
                console.log('signIn set');
            });
        });
    });
});