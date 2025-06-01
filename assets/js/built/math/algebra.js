"use strict";

Algebra.quadraticEquation = (a, b, c) => {
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        // No real roots
        return [];
    } else if (discriminant === 0) {
        // One real root
        return [-b / (2 * a)];
    } else {
        const sqrtDisc = Math.sqrt(discriminant);
        const root1 = (-b + sqrtDisc) / (2 * a);
        const root2 = (-b - sqrtDisc) / (2 * a);
        return [root1, root2];
    }
}

Algebra.logarithmicProgress = (current, start, end) => {
    if (start >= end)
        return 0;
        
    if (current <= start)
        return 0;

    if (current >= end)
        return 1;
    
    const startLog = Math.log(start);
    return (Math.log(current) - startLog) / (Math.log(end) - startLog);
}