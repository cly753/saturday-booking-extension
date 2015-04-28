
var activityId = {
    "Volleyball" : 293
};

var venueId = {
    "MOE (Evans) Outdoor Facilities" : 249
};

var Action = {
    signIn: 1,
    book: 2,
    release: 3,
    clear: 4,
    updateIndex: 5,
    idle: 6
};
var ActionReadable = {
    1: 'Action-Sign-In',
    signIn: 'Action-Sign-In',

    2: 'Action-Book',
    book: 'Action-Book',

    3: 'Action-Release',
    release: 'Action-Release',

    4: 'Action-Clear',
    clear: 'Action-Clear',

    5: 'Action-Update-Index',
    updateIndex: 'Action-Update-Index',

    6: 'Action-Idle',
    idle: 'Action-Idle'
};

var allTemplate = {
    user: {
        username: '',
        password: ''
    },
    plan: {
        activity: '',
        venue: '',
        date: '1970-01-01',
        hour: [],
        additionalPattern: ''
    },
    host: '',
    index: {
        activity: {
            "Volleyball" : 293
        },
        venue: {
            "MOE (Evans) Outdoor Facilities" : 249
        }
    },
    action: []
};

var Plan = function(p, index) {
    var self = this;

    self.activity = p.activity;
    self.venue = p.venue;

    self.date = moment(p.date);
    self.openDate = moment(p.date);
    self.openDate.subtract(14, 'days').add(7, 'hours');
    //self.openDate.subtract(14, 'days').add(1, 'hours').add(22, 'minutes');

    self.hour = p.hour;
    self.pattern = $.map(self.hour, function(h, i) {
        return (h < 10 ? '0' : '') + h + ':00:00;' + (h + 1 < 10 ? '0' : '') + (h + 1) + ':00:00';
    });
    self.additionalPattern = p.additionalPattern;

    self.bookUrlSuffix = "/facilities/view/activity/"
        //+ activityId[self.activity]
        + index.activity[self.activity]
        + "/venue/"
        //+ venueId[self.venue]
        + index.venue[self.venue]
        + "?time_from="
        + self.date.unix();

    self.storeFormat = function() {
        return {
            activity: self.activity,
            venue: self.venue,
            date: self.date.format(),
            hour: self.hour,
            additionalPattern: self.additionalPattern
        };
    };

    //console.log('Newing plan from p', p);
    //console.log('Newing plan to plan', self);

    if (self.hour.length > 2)
        console.log("Too many hours for one plan!");
};