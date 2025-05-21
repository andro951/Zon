"use strict";

Algebra.quadraticEquation = function(a, b, c) {
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