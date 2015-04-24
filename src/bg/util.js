
var activityId = {
    "Volleyball" : 293
};

var venueId = {
    "MOE (Evans) Outdoor Facilities" : 249
};

var Plan = function(p) {
    var self = this;

    self.priority = p.priority;

    self.activity = p.activity;
    self.venue = p.venue;
    self.date = p.date;
    self.hour = p.hour;

    self.bookUrlSuffix = (function() {
        return "/facilities/view/activity/"
            + activityId[self.activity]
            + "/venue/"
            + venueId[self.venue]
            + "?time_from="
            + moment(self.date).unix();
    })();

    if (self.hour.length > 2)
        console.log("Too many hours for one plan!");
};