"use strict";

Trig.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
}

Trig.atan2 = function(y, x) {
    throw new Error("Don't use this function, use Math.atan2 instead");
    if (x > 0) {
        //Quadrant I or IV
        return Math.atan(y / x);
    } else if (x < 0 && y >= 0) {
        //Quadrant II
        return Math.atan(y / x) + Math.PI;
    } else if (x < 0 && y < 0) {
        //Quadrant III
        return Math.atan(y / x) - Math.PI;
    } else if (x === 0 && y > 0) {
        //Straight up
        return Math.PI / 2;
    } else if (x === 0 && y < 0) {
        //Straight down
        return -Math.PI / 2;
    } else {
        return 0;
    }

    //if x is 0, result is +/- PI/2 depending on the sign of y
    //tan(theta) = o/a = y/x => theta = atan(y/x)
    //if in quadrant II, add PI
    //if in quadrant III, subtract PI
}