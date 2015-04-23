
var activityId = {
    "Volleyball" : 293
};

var venueId = {
    "MOE (Evans) Sports Hall" : 318
};

var Plan = function(p) {
    var self = this;

    self.priority = p.priority;

    self.activity = p.activity;
    self.venue = p.venue;
    self.date = p.date;
    self.hour = p.hour;

    self.getBookUrlSuffix = function () {
        return "/facilities/view/activity/"
            + activityId[self.activity]
            + "/venue/"
            + venueId[self.venue]
            + "?time_from="
            + moment(self.date).unix();
    };

    self.match = function (value) {
        var yes = false;
        $.each(hour, function(i, o) {
            yes = value.indexOf(o + ":00:00;" + (o + 1) + ":00:00") != -1;
        });

        console("matching ", value);
        console("hour.... ", hour);
        console("yes", yes);
        return yes;
    };

    if (self.hour.length > 2)
        console.log("Too many hours for one plan!");
};