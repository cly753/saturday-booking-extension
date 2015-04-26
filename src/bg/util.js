
var activityId = {
    "Volleyball" : 293
};

var venueId = {
    "MOE (Evans) Outdoor Facilities" : 249
};

var Plan = function(p) {
    var self = this;

    self.activity = p.activity;
    self.venue = p.venue;

    self.date = moment(p.date);
    self.openDate = moment(p.date);
    //self.openDate.subtract(15, 'days').add(7, 'hours');
    self.openDate.subtract(14, 'days').add(17, 'hours').add(16, 'minutes');

    self.hour = p.hour;
    self.pattern = $.map(self.hour, function(h, i) {
        return (h < 10 ? '0' : '') + h + ':00:00;' + (h + 1 < 10 ? '0' : '') + (h + 1) + ':00:00';
    });
    self.additionalPattern = p.additionalPattern;

    self.bookUrlSuffix = "/facilities/view/activity/"
        + activityId[self.activity]
        + "/venue/"
        + venueId[self.venue]
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