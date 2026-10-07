"use strict";

const ZonScript = {};

ZonScript.grammar = String.raw`
script      : meta_data stmt_list
meta_data   : (META_DATA* META_END?)?
stmt_list   : stmt*
stmt {stmt} : (LET | CONST | VAR) var EQUALS exp SEMI? {declare}
            | (LET | CONST | VAR) var SEMI? {declare no_value}
            | var EQUALS exp SEMI? {assign no_declare}
            | PRINT exp? SEMI? {print}
            | PRINT LPAREN exp RPAREN SEMI? {print}
            | IF LPAREN exp RPAREN THEN? stmt (ELSE stmt)? {if}
            | IF exp THEN? stmt (ELSE stmt)? {if}
            | block
            | action SEMI?
            | (FOREACH | FOR) LPAREN (LET | CONST | VAR)? var (IN | OF | COLON) exp RPAREN stmt {foreach}
            | (FOREACH | FOR) (LET | CONST | VAR)? var (IN | OF | COLON) exp stmt {foreach}
            //| BREAK SEMI? {break}
            //| CONTINUE SEMI? {continue}
            | RETURN exp? SEMI? {return}
            | var LPAREN var... RPAREN block {func_declare}
            | stmt_exp SEMI?
block {block}   : LBRACE stmt_list RBRACE
                | DO stmt_list END
                | BEGIN stmt_list END
exp {exp}   : ternary
ternary     : exp_or (QUESTION exp COLON exp)? {ternary}
exp_or      : exp_and (op_or exp_and)*
exp_and     : exp_cmp (op_and exp_cmp)*
exp_cmp     : exp_add (op_cmp exp_add)*
exp_add     : exp_mul (op_add exp_mul)*
exp_mul     : exp_unary (op_mul exp_unary)*
exp_unary   : op_unary exp_unary
            | exp_pow
exp_pow     : exp_atom (op_pow exp_pow)? //right associative
exp_atom    : def_func
            | stmt_exp
            | num
            | par
            | BOOL
            | STRING
            | var {get}
            | act_avail
action      : ATSYM NAME (LPAREN exp... RPAREN)?
act_avail   : ATSYM NAME (LPAREN exp... RPAREN)? (AVAILABLE | QUESTION)
def_func    : log
            | floor
            | trunc
            | ceil
            | round
log         : LN LPAREN exp RPAREN 
            | LOG NUMBER? LPAREN exp RPAREN
            | LOG LPAREN exp COMMA exp RPAREN
ln          : LN LPAREN exp RPAREN
floor       : FLOOR LPAREN exp RPAREN
trunc       : TRUNC LPAREN exp RPAREN
ceil        : CEIL LPAREN exp RPAREN
round       : ROUND LPAREN exp RPAREN
stmt_exp {stmt_exp} : var LPAREN exp... RPAREN {func_call}
            | var PP {post_inc}
            | var MM {post_dec}
            | PP var {pre_inc}
            | MM var {pre_dec}
op_or       : OR {||}
op_and      : AND {&&}
op_cmp      : EQ {==} | NEQ {!=} | LT {<} | LTE {<=} | GT {>} | GTE {>=}
op_add      : ADD {+} | SUB {-}
op_mul      : MUL {*} | DIV {/} | MOD {%}
op_unary    : SUB {-#} | NOT {!} | ADD {+#}
op_pow      : POW {^}
num         : NUMBER
par         : LPAREN exp RPAREN {par}
var {var}   : NAME
COMMENT_H   : /#.*$/m (IGNORE)
COMMENT_S   : /\/\/.*$/m (IGNORE)
COMMENT_B   : /\/\*[\s\S]*?\*\// (IGNORE)
META_DATA   : /([A-Za-z]+)\s*:\s*([\s\S]*?)(?=\s*[A-Za-z]+\s*:|\s*-{3,}|$)/ (KEEP)
META_END    : /-{3,}/ (KEEP) //3 or more "-"'s
LPAREN      : /\(/
RPAREN      : /\)/
LBRACE      : /\{/
RBRACE      : /\}/
IF          : /if/
ELSE        : /else/
THEN        : /then/
LET         : /let/
PRINT       : /print/
FOREACH     : /foreach/
FOR         : /for/
IN          : /in/
OF          : /of/
VAR         : /var/
CONST       : /const/
BEGIN       : /begin/
DO          : /do/
END         : /end/
AVAILABLE   : /available/
LN          : /ln/
LOG         : /log/
FLOOR       : /floor/
TRUNC       : /trunc/
ROUND       : /round/
CEIL        : /ceil/
RETURN      : /return/
CONTINUE    : /continue/
BREAK       : /break/
SEMI        : /;/
COLON       : /:/
OR          : /\|\|/
AND         : /&&/
EQ          : /==/
NEQ         : /!=/
LTE         : /<=/
GTE         : />=/
LT          : /</
GT          : />/
EQUALS      : /=/
PP          : /\+\+/
MM          : /--/
ADD         : /\+/
SUB         : /-/
MUL         : /\*/
DIV         : /\//
POW         : /\^/
NOT         : /!/
MOD         : /%/
ATSYM       : /@/
QUESTION    : /\?/
BOOL        : /(?:true|false)/ (bool)
NAME        : /[A-Za-z_][A-Za-z0-9_]*/ (KEEP)
NUMBER      : /(\d+(?:\.\d*)?|\.\d+)(?:([eE])([+-]?\d+)|(k|m|b|t|qa|qu|sx|sp|o|n|d))?/ (float)
//FLOAT       : /(\d+\.\d*|\.\d+)(?:(\d+(?:\.\d*)?|\.\d+)(?:([eE])([+-]?\d+)|(k|m|b|t|qa|qu|sx|sp|o|n|d))?)/ (float)
//FLOAT       : /(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?/ (float)
//INT         : /(?:0[bB][01]+|0[oO][0-7]+|0[xX][0-9A-Fa-f]+|\d+)/ (int)
STRING      : /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ (string)
`;

ZonScript.getActionArgumentsFromAST = (argsArr) => {
    let args;
    if (Array.isArray(argsArr)) {
        args = argsArr.map(arg => arg.exec());
    }
    else {
        if (!argsArr.empty)
            throw new Error(`Expected argsArr to be empty when it's not an array. Given: ${argsArr}`);

        args = [];
    }

    return args;
}

ZonScript.callActionFromAST = (NAME, argsArr) => {
    const name = NAME.exec();
    const args = ZonScript.getActionArgumentsFromAST(argsArr);

    return ZonScript.sf.runScriptAction(name, args);
}

//Math log
ZonScript.logFunc = (val, base) => {
    if (val instanceof Struct.BigNumber) {
        if (base instanceof Struct.BigNumber)
            base = base.toNumber();

        return val.logNumber(base);
    }

    return Math.log2(val) / Math.log2(base);
}

ZonScript.functions = [
    new GrammarForge.RuleFunctionDefinition(
        'script',
        'meta_data stmt_list',
        ([meta_data, stmt_list]) => {
            throw new Error(
                "Script execution should be started from ScriptForge.Script.ast, not directly from GrammarForge.parse."
            );
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'stmt',
        'action SEMI?',
        (action) => {
            action.exec();
            return GrammarForge.NORMAL_CONTROL;
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'action',
        'ATSYM NAME (LPAREN exp... RPAREN)?',
        ([NAME, optionalParen]) => {
            return ZonScript.callActionFromAST(NAME, optionalParen);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'act_avail',
        'ATSYM NAME (LPAREN exp... RPAREN)? (AVAILABLE | QUESTION)',
        ([NAME, argsArr]) => {
            const name = NAME.exec();
            const parameters = ZonScript.getActionArgumentsFromAST(argsArr);
            return ZonScript.sf.scriptActionAvailable(name, parameters);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'log',
        'LN LPAREN exp RPAREN',
        (exp) => {
            const val = exp.exec();

            if (val instanceof Struct.BigNumber)
                return val.lnNumber();

            return Math.log(val);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'log',
        'LOG NUMBER? LPAREN exp RPAREN',
        ([NUMBER, exp]) => {
            const val = exp.exec();
            const base = NUMBER ? NUMBER.exec() : 10;
            return ZonScript.logFunc(val, base);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'log',
        'LOG LPAREN exp COMMA exp RPAREN',
        ([exp1, exp2]) => {
            const val = exp1.exec();
            const base = exp2.exec();
            return ZonScript.logFunc(val, base);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'floor',
        'FLOOR LPAREN exp RPAREN',
        (exp) => {
            const val = exp.exec();

            if (val instanceof Struct.BigNumber)
                return val.floorI().tryToNumberI();

            return Math.floor(val);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'ceil',
        'CEIL LPAREN exp RPAREN',
        (exp) => {
            const val = exp.exec();

            if (val instanceof Struct.BigNumber)
                return val.ceilI().tryToNumberI();

            return Math.ceil(val);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'trunc',
        'TRUNC LPAREN exp RPAREN',
        (exp) => {
            const val = exp.exec();

            if (val instanceof Struct.BigNumber)
                return val.truncI().tryToNumberI();

            return Math.trunc(val);
        }
    ),
    new GrammarForge.RuleFunctionDefinition(
        'round',
        'ROUND LPAREN exp RPAREN',
        (exp) => {
            const val = exp.exec();

            if (val instanceof Struct.BigNumber)
                return val.roundI().tryToNumberI();

            return Math.round(val);
        }
    ),
];

ZonScript.gf = new GrammarForge(ZonScript.grammar, ZonScript.functions);
ZonScript.gf.disableRecursion();

ZonScript.gf.setParseTokenFunction('NUMBER', (token) => {
    const match = token.value.match(ZonScript.floatRegex);
    if (!match) {
        throw new Error(`Invalid NUMBER token: ${token.value}`);
    }

    const numberPart = match[1];
    const exponentPart = match[2];
    const exponentValue = match[3];
    const abbreviationPart = match[4];
    const num = parseFloat(numberPart);
    if (!isFinite(num))
        throw new Error(`Invalid number: ${token.value}.  ${numberPart} failed to parse as a finite number. (${numberPart} -> ${num})`);

    if (num === 0)
        return 0;

    let exp;
    if (exponentPart || abbreviationPart) {
        if (exponentPart) {
            if (!exponentValue)
                throw new Error(`Invalid exponent: ${token.value}.  Exponent part was detected (${exponentPart}), but no exponent value was found. (${token.value})`);

            exp = parseInt(exponentValue, 10);
            if (!isFinite(exp))
                throw new Error(`Invalid exponent: ${token.value}.  ${exponentValue} failed to parse as a finite integer. (${exponentValue} -> ${exp})`);
        }
        else {
            const abbreviation = abbreviationPart.toLowerCase();
            exp = Struct.BigNumber.abbreviationGroups[abbreviation] * 3;
            if (exp === undefined)
                throw new Error(`Invalid abbreviation: ${token.value}.  Abbreviation part was detected (${abbreviationPart}), but it was not recognized as a valid abbreviation. (${token.value})`);
        }

        if (exp === 0)
            return num;
        
        const value = num * Math.pow(10, exp);

        if (Number.isFinite(value) && value !== 0)
            return value;
        
        return Struct.BigNumber.fromBase10Exp(num, exp);
    }
    else {
        return num;
    }
});

ZonScript.floatRegex = /(\d+(?:\.\d*)?|\.\d+)(?:([eE])([+-]?\d+)|(k|m|b|t|qa|qu|sx|sp|o|n|d))?/;//Same as NUMBER in ZonScript.

ZonScript.oldGetVariableFunc = ZonScript.gf.execution.get_variable;
ZonScript.gf.execution.get_variable = (name) => {
    const value = ZonScript.oldGetVariableFunc(name);
    if (value instanceof Struct.BigNumber)
        return value.tryToNumber();

    return value;
}

function promoteBinary(a, b) {
    const aIsBig = a instanceof Struct.BigNumber;
    const bIsBig = b instanceof Struct.BigNumber;

    if (!aIsBig && !bIsBig)
        return null;

    if (!aIsBig) {
        if (typeof a !== "number")
            return null;

        a = a.BN();
    }

    if (!bIsBig) {
        if (typeof b !== "number")
            return null;

        b = b.BN();
    }

    return { a, b };
}

ZonScript.gf.replaceOpFunction('+', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.addI(p.b).tryToNumberI();

    if (typeof a !== "number" || typeof b !== "number")
        return a + b;

    if (a > 0) {
        if (b < 0)
            return a + b;

        const maxB = Number.MAX_VALUE - a;
        if (b <= maxB)
            return a + b;

        // Overflow
        return a.BN().addI(b.BN());
    } 
    else {
        if (b > 0)
            return a + b;

        const minB = -Number.MAX_VALUE - a;
        if (b >= minB)
            return a + b;

        // Underflow
        return a.BN().addI(b.BN());
    }
});

ZonScript.gf.replaceOpFunction('-', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.subtractI(p.b).tryToNumberI();

    if (typeof a !== "number" || typeof b !== "number")
        return a - b;

    if (a > 0) {
        if (b > 0)
            return a - b;

        const maxA = Number.MAX_VALUE + b;
        if (a <= maxA)
            return a - b;

        // Overflow
        return a.BN().subtractI(b.BN());
    } 
    else {
        if (b < 0)
            return a - b;

        const minA = -Number.MAX_VALUE + b;
        if (a >= minA)
            return a - b;

        // Underflow
        return a.BN().subtractI(b.BN());
    }
});

ZonScript.gf.replaceOpFunction('*', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.multiplyI(p.b).tryToNumberI();

    if (typeof a !== "number" || typeof b !== "number")
        return a * b;

    if (a === 0 || b === 0)
        return 0;

    const absA = Math.abs(a);
    const absB = Math.abs(b);
    if (absA <= 1 || absB <= 1)
        return a * b;

    const maxB = Number.MAX_VALUE / absA;
    if (absB <= maxB)
        return a * b;

    // Overflow
    return a.BN().multiplyI(b.BN());
});

ZonScript.gf.replaceOpFunction('/', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.divideI(p.b).tryToNumberI();

    if (typeof a !== "number" || typeof b !== "number")
        return a / b;
    
    const absB = Math.abs(b);
    if (absB >= 1)
        return a / b;

    if (b === 0)
        throw new Error("Division by zero");

    const absA = Math.abs(a);
    const maxA = Number.MAX_VALUE * absB;
    if (absA <= maxA)
        return a / b;

    // Overflow
    return a.BN().divideI(b.BN());
});

ZonScript.gf.replaceOpFunction('%', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.modI(p.b).tryToNumberI();

    return a % b;
});

ZonScript.logNumberMaxValue = Math.log(Number.MAX_VALUE);

ZonScript.gf.replaceOpFunction('^', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.powI(p.b).tryToNumberI();

    if (typeof a !== "number" || typeof b !== "number")
        return a ^ b;

    if (b === 0)
        return 1;

    if (a === 0)
        return 0;

    if (a > 0) {
        const maxB = ZonScript.logNumberMaxValue / Math.log(a);
        if (b <= maxB)
            return a ** b;

        // Overflow
        return a.BN().powI(b.BN());
    }
    else {
        // Negative base, exponent must be integer
        if (!Number.isInteger(b))
            throw new Error(`Exponent must be an integer for negative base. Given: ${b}`);

        const absA = Math.abs(a);
        const maxB = ZonScript.logNumberMaxValue / Math.log(absA);
        if (b <= maxB) {
            if (b % 2 === 0)
                return absA ** b;
            else
                return -(absA ** b);
        }

        // Overflow
        return a.BN().powI(b.BN());
    }
});

ZonScript.gf.replaceOpFunction('-#', (a) => {
    if (a instanceof Struct.BigNumber)
        return a.negativeI();

    return -a;
});

ZonScript.gf.replaceOpFunction('+#', (a) => {
    if (a instanceof Struct.BigNumber)
        return a;

    return +a;
});

ZonScript.gf.replaceOpFunction('==', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.equals(p.b);

    return a === b;
});

ZonScript.gf.replaceOpFunction('!=', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.notEquals(p.b);

    return a !== b;
});

ZonScript.gf.replaceOpFunction('<', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.lessThan(p.b);

    return a < b;
});

ZonScript.gf.replaceOpFunction('<=', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.lessThanOrEqual(p.b);

    return a <= b;
});

ZonScript.gf.replaceOpFunction('>', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.greaterThan(p.b);

    return a > b;
});

ZonScript.gf.replaceOpFunction('>=', (a, b) => {
    const p = promoteBinary(a, b);
    if (p)
        return p.a.greaterThanOrEqual(p.b);

    return a >= b;
});

ZonScript.runEquivalentNumericBenchmark = () => {
    const withLogTime = ZonScript._runEquivalentNumericBenchmark(true);
    const withoutLogTime = ZonScript._runEquivalentNumericBenchmark(false);
    const logWithPrintArray = ZonScript._runEquivalentNumericBenchmark(true, true);
    console.log(`Benchmark completed in ${withLogTime} milliseconds. (with logging)`);
    console.log(`Benchmark completed in ${withoutLogTime} milliseconds. (without logging)`);
    console.log(`Benchmark completed in ${logWithPrintArray} milliseconds. (with logging to array)`);
}

ZonScript._runEquivalentNumericBenchmark = (doConsoleLog, usePrintArray = false) => {
    const BN = Struct.BigNumber;

    function isBN(x) { return x instanceof BN; }

    function toBN(x)
    {
        if (isBN(x)) return x;
        return BN.fromBase10Exp(x, 0);
    }

    function promote(a, b)
    {
        if (isBN(a) || isBN(b))
            return [toBN(a), toBN(b), true];
        return [a, b, false];
    }

    function add(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.addI(y) : x + y;
    }

    function sub(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.subtractI(y) : x - y;
    }

    function mul(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.multiplyI(y) : x * y;
    }

    function div(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.divideI(y) : x / y;
    }

    function mod(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.modI(y) : x % y;
    }

    function pow(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.powI(y) : Math.pow(x,y);
    }

    function eq(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.equals(y) : x === y;
    }

    function neq(a,b) { return !eq(a,b); }

    function lt(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.lessThan(y) : x < y;
    }

    function lte(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.lessThanOrEqual(y) : x <= y;
    }

    function gt(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.greaterThan(y) : x > y;
    }

    function gte(a,b)
    {
        const [x,y,bn] = promote(a,b);
        return bn ? x.greaterThanOrEqual(y) : x >= y;
    }

    function neg(x)
    {
        return isBN(x) ? x.negativeI() : -x;
    }

    function pos(x)
    {
        return x;
    }

    function floor(x)
    {
        return isBN(x) ? x.floorI() : Math.floor(x);
    }

    function ceil(x)
    {
        return isBN(x) ? x.ceilI() : Math.ceil(x);
    }

    function trunc(x)
    {
        return isBN(x) ? x.truncI() : Math.trunc(x);
    }

    function round(x)
    {
        return isBN(x) ? x.roundI() : Math.round(x);
    }

    function ln(x)
    {
        return isBN(x) ? x.lnNumber() : Math.log(x);
    }

    function log(x,b)
    {
        if (isBN(x) || isBN(b))
            return toBN(x).logNumber(b);
        return Math.log(x) / Math.log(b);
    }

    function log2(x)
    {
        return isBN(x) ? x.log2Number() : Math.log2(x);
    }

    function num(exp)
    {
        return exp > 308
            ? BN.fromBase10Exp(1, exp)
            : 10 ** exp;
    }

    function sci(m,e)
    {
        return e > 308
            ? BN.fromBase10Exp(m,e)
            : m * 10 ** e;
    }

    function print(x)
    {
        const str = `${x}`;
        if (doConsoleLog) {
            if (usePrintArray) {
                printArr.push(str);
            }
            else {
                console.log(str);
            }
        }
    }

    // Begin identical execution sequence

    let printArr;

    const startTime = performance.now();

    if (usePrintArray)
        printArr = [];

    print("BigNumber, Expected: 1e1000, Actual: ");
    print(sci(1,1000));
    print("");

    print("Number, Expected: 100000000000000000000, Actual: ");
    print(sci(1,20));
    print("");

    print("Number, Expected: 1230, Actual: ");
    print(1230);
    print("");

    print("Number, Expected: 1.2345e+308, Actual: ");
    print(sci(1.2345,308));
    print("");

    print("Number, Expected: 1.2345e+308, Actual: ");
    print(sci(12.345,307));
    print("");

    print("BigNumber, Expected: 1.23e309, Actual: ");
    print(sci(12.3,308));
    print("");

    print(add(1,4));
    print("");

    print(add(sci(7,307), sci(7,307)));
    print("");

    print(add(sci(1,308), sci(1,308)));
    print("");

    print(add(sci(1,309), sci(1,308)));
    print("");

    print(add(sci(1,308), sci(1,309)));
    print("");

    print(add(sci(1,309), sci(1,309)));
    print("");

    let a = sci(1,1000);
    print("a: " + a);

    let b = add(a, sci(2,1000));
    print("a: " + a + ", b: " + b);

    print(add(2,3));
    print("");

    print(add(sci(1,309),5));
    print("");

    print(add(sci(1,309), sci(1,309)));
    print("");

    print(add(sci(1.5,308), sci(1.5,308)));
    print("");

    print(sub(10,3));
    print("");

    print(sub(sci(1,309),1));
    print("");

    print(sub(5, sci(1,309)));
    print("");

    print(sub(sci(2,309), sci(1,309)));
    print("");

    print(mul(6,7));
    print("");

    print(mul(sci(1,309),2));
    print("");

    print(mul(sci(1,309), sci(1,309)));
    print("");

    print(div(10,2));
    print("");

    print(div(sci(1,309),2));
    print("");

    print(div(10, sci(1,309)));
    print("");

    print(div(sci(1,308), sci(1,307)));
    print("");

    print(div(sci(1,310), sci(1,309)));
    print("");

    print(mod(10,3));
    print("");

    print(mod(sci(1,309),3));
    print("");

    print(mod(sci(5,309), sci(2,309)));
    print("");

    print(pow(2,10));
    print("");

    print(pow(sci(1,309),2));
    print("");

    print(pow(sci(1,309), sci(2,1)));
    print("");

    print(eq(5,5));
    print("");

    print(eq(sci(1,309), sci(1,309)));
    print("");

    print(neq(sci(1,309), sci(2,309)));
    print("");

    print(lt(sci(1,309), sci(2,309)));
    print("");

    print(lte(sci(1,309), sci(1,309)));
    print("");

    print(gt(sci(2,309), sci(1,309)));
    print("");

    print(gte(sci(2,309), sci(2,309)));
    print("");

    print(neg(5));
    print("");

    print(neg(sci(1,309)));
    print("");

    print(pos(sci(1,309)));
    print("");

    a = sci(1,309);
    b = add(a, sci(1,309));

    print("a: " + a);
    print("b: " + b);
    print("");

    print(add(5, sci(1,309)));
    print(add(sci(1,309),5));
    print("");

    print(pow(2,100000));
    print("");

    print(log2(pow(2,100000)));
    print("");

    print(ln(sci(1,1000)));
    print("");

    print(log(pow(2,100000),2));
    print("");

    a = 1.5;

    print("floor: " + a + " -> " + floor(a) + ", " + -a + " -> " + floor(-a));
    print("ceil: " + a + " -> " + ceil(a) + ", " + -a + " -> " + ceil(-a));
    print("trunc: " + a + " -> " + trunc(a) + ", " + -a + " -> " + trunc(-a));
    print("round: " + a + " -> " + round(a) + ", " + -a + " -> " + round(-a));

    a = pow(2, pow(2, pow(2, pow(2,2))));

    print("floor: " + a + " -> " + floor(a) + ", " + -a + " -> " + floor(-a));
    print("ceil: " + a + " -> " + ceil(a) + ", " + -a + " -> " + ceil(-a));
    print("trunc: " + a + " -> " + trunc(a) + ", " + -a + " -> " + trunc(-a));
    print("round: " + a + " -> " + round(a) + ", " + -a + " -> " + round(-a));

    if (usePrintArray) {
        const str = printArr.join("\n");
        console.log(str);
    }

    const endTime = performance.now();
    return endTime - startTime;
}