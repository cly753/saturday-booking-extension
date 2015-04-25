
var all = {
    option: {
        username: '',
        password: '',
        host: '',
        plan: []
    },
    id: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    },
    action: ''
};

var conf = {
    image: [
        {
            user: {
                username: '',
                password: ''
            },
            plan: [],
            action: ''
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

var saveOptions = function() {
    all.option.username = $("#username").val();
    all.option.password = $("#password").val();
    all.option.host = $("#host").val();
    //var match = $("#match").val();

    chrome.storage.sync.set({
        all: all
    }, function() {
        console.log('set allll', allll);
        $("#saveButton").prop('text', 'Save !');
    });
};

var restoreOptions = function() {
    chrome.storage.sync.get({
        all: all
    }, function(store) {
        all = store.all;
        console.log('restore', all);

        $("#username").val(all.option.username);
        $("#password").val(all.option.password);
        $("#host").val(all.option.host);
    });
};

$(document).ready(function() {
    restoreOptions();
    $("#saveButton").click(saveOptions);
});