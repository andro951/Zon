"use strict";

const StringHelper = {};

String.prototype.RemoveTrailingZeros = function() {
    const dotIndex = this.indexOf('.');
    if (dotIndex < 0) return this;

    for (let i = this.length - 1; i > dotIndex; i--) {
        if (this[i] !== '0') {
            if (this[i] === '.') {
                return this.substring(0, i);
            } else {
                return this.substring(0, i + 1);
            }
        }
    }

    return this.substring(0, dotIndex);
};
/*
private static string ToTime(bool daysGreaterThanZero, string days, float time, int secondsDecimal = 2, bool secondsRemoveTrailingZeros = true) {
	int hours = (int)time / 3600;
	time %= 3600;
	int minutes = (int)time / 60;
	time %= 60;
	float seconds = time;
	bool first = true;
	string s = "";
	if (daysGreaterThanZero) {
		if (first) {
			first = false;
		}
		else {
			s += ", ";
		}

		s += $"{days} days";
	}

	if (hours > 0) {
		if (first) {
			first = false;
		}
		else {
			s += ", ";
		}

		s += $"{hours} hrs";
	}

	if (minutes > 0) {
		if (first) {
			first = false;
		}
		else {
			s += ", ";
		}

		s += $"{minutes} min";
	}

	if (seconds > 0f || first) {
		if (first) {
			first = false;
		}
		else {
			s += ", ";
		}

		s += $"{seconds.S(secondsDecimal, secondsRemoveTrailingZeros)} sec";
	}

	return s;
}
*/
//public static string ToTime(Triple triple, float remainingTime, int decimals = 2, bool scientific = false, bool removeTrailingZeros = true) => 
// ToTime(triple > Triple.Zero, triple.S(decimals, scientific, removeTrailingZeros), remainingTime);
StringHelper.ToTime = function(daysGreaterThanZero, days, time, secondsDecimal = 2, secondsRemoveTrailingZeros = true) {
    let hours = Math.floor(time / 3600);
    time %= 3600;
    let minutes = Math.floor(time / 60);
    time %= 60;
    let seconds = time;
    let first = true;
    let s = "";
    if (daysGreaterThanZero) {
        if (first) {
            first = false;
        } else {
            s += ", ";
        }

        s += `${days} days`;
    }

    if (hours > 0) {
        if (first) {
            first = false;
        } else {
            s += ", ";
        }

        s += `${hours} hrs`;
    }

    if (minutes > 0) {
        if (first) {
            first = false;
        } else {
            s += ", ";
        }

        s += `${minutes} min`;
    }

    if (seconds > 0 || first) {
        if (first) {
            first = false;
        } else {
            s += ", ";
        }

        s += `${seconds.S(secondsDecimal, secondsRemoveTrailingZeros)} sec`;
    }

    return s;
}
StringHelper.ToTime2 = function(triple, remainingTime, decimals = 2, scientific = false, removeTrailingZeros = true) {
    return StringHelper.ToTime(triple > Numbers.Triple.Zero, triple.S(decimals, scientific, removeTrailingZeros), remainingTime);
}