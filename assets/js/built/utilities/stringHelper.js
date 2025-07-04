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
StringHelper.ToTime2 = function(bigNumber, remainingTime, decimals = 2, scientific = false, removeTrailingZeros = true) {
    return StringHelper.ToTime(bigNumber.isPositive, bigNumber.S(decimals, scientific, removeTrailingZeros), remainingTime);
}

String.prototype.isUpper = function() {
    const code = this.charCodeAt(0);
    return code >= 65 && code <= 90; // 'A' - 'Z'
}

String.prototype.isLower = function() {
    const code = this.charCodeAt(0);
    return code >= 97 && code <= 122; // 'a' - 'z'
}

String.prototype.isNumber = function() {
    const code = this.charCodeAt(0);
    return code >= 48 && code <= 57; // '0' - '9'
}

String.prototype.isUpperOrNumber = function() {
    const code = this.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 48 && code <= 57);
}

StringHelper.lowerCaseAddSpacesStringWords = ["of"];

String.prototype.addSpaces = function(checkLowerCaseWords = false, space = " ") {
    if (!this || this.length < 2)
        return this;

    let result = "";
    let start = 0;
    let prev = this[0];
    let curr = this[1];

    for (let i = 2; i < this.length; i++) {
        const prev2 = prev;
        prev = curr;
        curr = this[i];

        const prevIsUpperOrNum = prev.isUpperOrNumber();
        const currIsUpperOrNum = curr.isUpperOrNumber();

        if (!prevIsUpperOrNum && currIsUpperOrNum) {
            if (prev === ' ') continue;
            result += this.slice(start, i - 1 + 1) + space;
            start = i;
        } else if (prevIsUpperOrNum && prev2.isUpperOrNumber() && !currIsUpperOrNum) {
            if (curr === ' ') continue;
            result += this.slice(start, i - 2 + 1) + space;
            start = i - 1;
        }
    }

    result += this.slice(start);

    if (checkLowerCaseWords) {
        for (const word of StringHelper.lowerCaseAddSpacesStringWords) {
            const pattern = `${word} `;
            let index = result.indexOf(pattern);
            while (index > 0) {
                if (result[index - 1] !== ' ') {
                    result = result.slice(0, index) + space + result.slice(index);
                    index += space.length + word.length + 1;
                } else {
                    index = result.indexOf(pattern, index + 1);
                }
            }
        }
    }

    return result;
}

String.prototype.removeFileExtension = function() {
    const lastDotIndex = this.lastIndexOf('.');
    if (lastDotIndex === -1)
        return this;
    
    return this.substring(0, lastDotIndex);
}