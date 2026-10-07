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

Algebra.linearProgress = (current, start, end) => {
    if (start >= end)
        return 0;
        
    if (current <= start)
        return 0;

    if (current >= end)
        return 1;

    return (current - start) / (end - start);
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

//Arithmetic Sequence:
//an = a0 + n * d       (0 based index)
//Where:
//an: The nth term of the sequence
//a0: The first term of the sequence
//d: The common difference between consecutive terms
//d = an - a<n-1>
//Sum = (n * (2 * a0 + (n - 1) * d)) / 2
//Proof:
//When n is even:
//Sum = a0 + (a0 + d) + (a0 + 2d) + ... + (a0 + (n - 3)d) + (a0 + (n - 2)d) + (a0 + (n - 1)d)
//Sum = (2 * a0 + (n - 1)d) + (2 * a0 + (n - 1)d) + (2 * a0 + (n - 1)d) + ...
//Sum = n/2 * (2 * a0 + (n - 1)d)
//Sum = (n * (2 * a0 + (n - 1)d)) / 2
//When n is odd:
//Sum = a0 + (a0 + d) + ... + (a0 + (n - 1)/2 * d) + ... + (a0 + (n - 2)d) + (a0 + (n - 1)d)
//Sum = (2 * a0 + (n - 1)d) + (2 * a0 + (n - 1)d) + ... + (a0 + (n - 1)/2 * d)
//Sum = (n - 1)/2 * (2 * a0 + (n - 1)d) + (a0 + (n - 1)/2 * d)
//Sum = n/2 * (2 * a0 + (n - 1)d) - (a0 + (n - 1)/2 * d) + (a0 + (n - 1)/2 * d)
//Sum = (n * (2 * a0 + (n - 1)d)) / 2
//Concrete Example:
//a0 = 1, d = 3, n = 4
//Sum = 1 + (1 + 3) + (1 + 2 * 3) + (1 + 3 * 3)
//Sum = (2 * 1 + 3 * 3) + (2 * 1 + 3 * 3)
//Sum = 2 * (2 * 1 + 3 * 3)
//Sum = 2 * 11
//Sum = 22
//Sum = (n * (2 * a0 + (n - 1)d)) / 2
//Sum = (4 * (2 * 1 + (4 - 1) * 3)) / 2
//Sum = (4 * (2 + 9)) / 2
//Sum = (4 * 11) / 2
//Sum = 22
//a0 = 1, d = 3, n = 5
//Sum = 1 + (1 + 3) + (1 + 2 * 3) + (1 + 3 * 3) + (1 + 4 * 3)
//Sum = (2 * 1 + 4 * 3) + (2 * 1 + 4 * 3) + (1 + 2 * 3)
//Sum = 2 * (2 * 1 + 4 * 3) + (1 + 2 * 3)
//Sum = 2 * 14 + 7
//Sum = 35
//Sum = (n * (2 * a0 + (n - 1)d)) / 2
//Sum = (5 * (2 * 1 + (5 - 1) * 3)) / 2
//Sum = (5 * (2 + 12)) / 2
//Sum = (5 * 14) / 2
//Sum = 35

//Arithmetic Sequences:
//an = D
//Sum = D * n
//n = Floor(Sum / D)

//an = C * n
//Sum = C * (n * (n - 1)) / 2
//n = Floor((1 + sqrt(1 + 8 * Sum / C)) / 2)

//an = B * n^2
//Sum = B * (n * (n - 1) * (2 * n - 1)) / 6
//0 = 2 * n^3 - 3 * n^2 + n - Sum * 6 / B
// 0 = n^3 - 3/2 * n^2 + 1/2 * n - Sum * 3 / B
//Solving for n doesn't have a simple formula, so it's not worth it.
//n = cbrt(Sum)

//an = A * n^3
//Sum = A * (n^2 * (n - 1)^2) / 4
//n = Floor((1 + sqrt(1 + 4 * sqrt(Sum * 4 / A))) / 2)

//Combined Arithmetic Sequences:
//an = C * n + D
//Sum = C * (n * (n - 1)) / 2 + D * n
//Sum = n * (C * (n - 1) / 2 + D)
//K = (D - C / 2)
//n = (-K + sqrt(K^2 + 2 * C * Sum)) / C

//an = A * n^3 + C * n
//Sum = A * (n^2 * (n - 1)^2) / 4 + C * (n * (n - 1)) / 2
//K = (-C + sqrt(C^2 + 4 * A * Sum)) / (2 * A)
//n = (1 + sqrt(1 + 8 * K)) / 2

//Geometric Sequence:
//an = a0 * r^n         (0 based index)
//Where:
//an: The nth term of the sequence
//a0: The first term of the sequence
//r: The common ratio between consecutive terms
//r = an / a<n-1>
//Sum = a0 * (1 - r^n) / (1 - r) {makes most sense when r < 1}
//Sum = a0 * (r^n - 1) / (r - 1) {makes most sense when r > 1}
//Sum = (LastTerm * r - firstTerm) / (r - 1) {Used when you know the first and last term}
//n = log2(Sum / a0 * (r - 1) + 1) / log2(r)




//xp to level ideas that require BigNumber
//https://docs.google.com/spreadsheets/d/1JHJg3tdnCSGlcDcP1DRnDN-tixN5lYCU-Xe_uwwL0Ms/edit?usp=sharing
//
//Equations that make use of progressLevelTracker_Sum_BN, allowing level to be massive with no risk
//Good for things like Core Empowerment level or rebirth upgrades with extremely high levels
//1. Exponential
//dxp = A * B^level
//xp = A * (B^level - 1) / (B - 1)
//level = logB(xp * (B - 1) / A + 1)

//2. Super Exponential
//dxp = A * B^(level^K)
//xp ~ A * B^((level - 1)^K)
//level ~ logB(xp / A + 1)^(1 / K) + 1

//Equations that can't use progressLevelTracker_Sum_BN, so max level should be constrained to prevent excessive work checking every level during a reset.  Probably best to have max level of like 10,000.
//Fine for things like core Enhancement level
