
var activityId = {
    "Volleyball" : 293
}

var venueId = {
    "MOE (Evans) Sports Hall" : 318
}

var Plan = function(p) {
    var self = this;

    self.priority = p.priority;

    self.activity = p.activity;
    self.venue = p.venue;
    self.date = p.date;
    self.hour = p.hour;

    self.getBookUrlSuffix = function() {
        var ret = "/facilities/view/activity/" + activityId[self.activity]
                + "/venue/" + venueId[self.venue]
                + "?time_from=" + moment(self.date).unix();
        return ret;
    }

    if (self.hour.length > 2)
        console.log("Too many hours for one plan!");
}