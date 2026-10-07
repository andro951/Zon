"use strict";

Zon.ScriptManager = class ScriptManager {
    constructor() {

    }

    postLoadSetup = () => {
        const scripts = Zon.ScriptIO.loadAllScripts();
        for (const [key, text] of scripts) {
            ZonScript.registerScriptFromText(key, text);
            console.log(`Loaded script: ${key}`);
        }

        ZonScript.sf.registerAllScriptTriggers();
        Zon.UI.scriptsUIState.onLoadAllScripts();
    }
}

ZonScript.onScriptError = (script) => {
    const panel = Zon.UI.scriptsUIState.scriptPannelsMap.get(script.key);
    if (panel) {
        panel.onError();
    }
    else if (zonDebug) {
        throw new Error(`Could not find script panel for script ${script.key} to mark it as errored.\nThis should never happen, but if it does, the script will still be disabled, just without the visual indication on the panel that it is errored.`);
    }
}

ZonScript.removeTryCatch = false;
ZonScript.logExecutionTime = true;

ZonScript.sf = new ScriptForge(ZonScript.gf, {
    onErrorInScriptFunction: (error, trigger, args, script) => {
        if (error instanceof ScriptForge.ScriptAction.ScriptActionError) {
            if (error instanceof ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError)
                return;//Handled in onErrorDuringActionFunction, don't log again here.

            throw error;//Errors inside an action that passed arg checks are the fault of zon, not the script.
        }

        Zon.error(`Error in ${script.key} (Script).\nThe script has been disabled.\n${error}`);
        ZonScript.onScriptError(script);
    },
    onErrorDuringActionFunction: (error, action, args, script, isCheckingAvailability) => {
        if (error instanceof ScriptForge.ScriptAction.ScriptActionInvalidArgumentsError) {
            if (isCheckingAvailability) {
                Zon.error(`Invalid arguments provided to @${action.name}? (Can use Action) while running ${script.key} (Script)\nThe script has been disabled.\nArguments provided: ${args}\nArguments Required: ${action.parameters !== null && action.canCallParameterCount !== 0 ? action.parameters.slice(0, action.canCallParameterCount) : "(none)"}\n${error}`);
            }
            else {
                Zon.error(`Invalid arguments provided to @${action.name} (Action) while running ${script.key} (Script)\nThe script has been disabled.\nArguments provided: ${args}\nArguments Required: ${action.parameters ?? "(none)"}\n${error}`);
            }
            
            ZonScript.onScriptError(script);
        }

        return false;
    },
    onParseScriptErrorFunction: (error, script) => {
        if (error instanceof ScriptForge.BadTriggerNameError) {
            Zon.warn(`Invalid trigger name (${error.badTriggerName}) found in script ${script.key}.\nThe script is still enabled, but the bad trigger has been skipped.\n${error}`);
        }
        else if (error instanceof ScriptForge.BadMetaDataLabelError) {
            Zon.warn(`Invalid metadata label found in script ${script.key}.\nThe script is still enabled, but the bad metadata label has been skipped.\n${error}`);
        }
        else {
            Zon.error(`Error parsing script ${script.key}.\nThe script has been disabled.\n${error}`);
        }

        //ZonScript.onScriptError(script);//No need to call this yet as the panel hasn't been created yet.
    },
    disableTryCatch: zonDebug && ZonScript.removeTryCatch,
    logExecutionTime: zonDebug && ZonScript.logExecutionTime
});

Zon.scriptManager = new Zon.ScriptManager();

ZonScript.runOldTestScripts = false;

if (zonDebug && ZonScript.runOldTestScripts) {

    ZonScript.gf.execution.logAllTests = true;

    {
        ZonScript.sf.defineScriptAction('testAction', () => {
            console.log(`Test action executed`);
        }, () => true, 'A test script action that logs a message to the console.');

        ZonScript.sf.defineScriptAction('testAction2', ([a, b, c]) => {
            console.log(`Test action 2 executed ${a}, ${b}, ${c}`);
        }, () => true, 'A test script action that logs a message to the console.');

        ZonScript.sf.defineScriptAction('testAction3', () => {
            console.log(`Test action 3 executed`);
        }, () => false, 'A test script action that logs a message to the console.');
    }

    ZonScript.gf.execution.logAllTests = true;

    ZonScript.test = () => {
        ZonScript.testGrammarForge();
    }

    ZonScript.testGrammarForge = () => {
        const metaDataTestProgramString = `
Title: Test Foreach
Description: A description for the foreach test.
but it can be on both lines.
Triggers: TestTrigger, AnotherTrigger
    YetAnotherTrigger       TrigALigginer
---
foreach (item in TestGlobalIterable) {
    print(item);
}
`;

        const tests = [
        [
`
Title: Test Title
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
`,
[  ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
{
    let a = 3;
    print(a);
}
{
    let a = 5;
    print(a);
}
`,
[ 3, 5 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
print(3 * 2);
`,
[ 3 * 2 ]
        ],
        [ 
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
# Calculate the result of an expression
let a = 3;
let x = 5.25e1 + a * (- 2 + - - - 8)^2;   

// This is a comment
/*
This is a block comment.
With multiple lines
*/
print(x);
`,
[ 5.25e1 + 3 * (-2 + - - -8) ** 2 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 5;
if (a == 5) {
    print(5);
}

print(1);
`,
[ 5, 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 3;
if (a == 5) {
    print(5);
}

print(1);
`,
[ 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 5;
if (a == 5) {
    print(5);
}
else {
    print(2);
}

print(1);
`,
[ 5, 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 3;
if (a == 5) {
    print(5);
}
else {
    print(2);
}

print(1);
`,
[ 2, 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 3;
if a == 5 {
    print(5);
}
else {
    print(2);
}

print(1);
`,
[ 2, 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 5;
let b = 10;
let c = 3;
print(a - b + c);
`,
[ -2 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a = 2;
let b = 3;
let c = 5;
print(a ^ b ^ c);
`,
[ 2 ** 3 ** 5 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
let a;
if (true) {
    a = 5;
}
else {
    a = 10;
}

print(a);
`,
[ 5 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
a = 1
if a <= 2
    a = a + 2

print(a);
`,
[ 3 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
print(1);
print(2);
@testAction
@testAction()
@testAction;
@testAction();
@testAction2(2, 1, 4);
@testAction2(24, 18, 34)
print(3);
`,
[ 1, 2, 3 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
testVar = 42
print(testVar)
`,
[ 42 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
@testAction2 (24 18 34)
print 42
`,
[ 42 ]
        ],
        [
metaDataTestProgramString,
[ 1, 2, 3, 4, 5 ],
new Map([
    ['TestGlobalIterable', [1, 2, 3, 4, 5] ]
])
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
foreach (item in TestGlobalIterable) {
    print(item);
}
`,
[ 1, 2, 3, 4, 5 ],
new Map([
    ['TestGlobalIterable', [1, 2, 3, 4, 5] ]
])
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
foreach (item in TestGlobalIterable) do
    print(item);
end
`,
[ 1, 2, 3, 4, 5 ],
new Map([
    ['TestGlobalIterable', [1, 2, 3, 4, 5] ]
])
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
foreach (item in TestGlobalIterable) begin
    print(item);
end
`,
[ 1, 2, 3, 4, 5 ],
new Map([
    ['TestGlobalIterable', [1, 2, 3, 4, 5] ]
])
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
a = @testAction available
print(a);
`,
[ true ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
if @testAction3 available
    print 1
else
    print 2
`,
[ 2 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
if @testAction3? then
    print 1
else
    print 2
`,
[ 2 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
a = @testAction3?
if a then {
    @testAction3
    print 1
}
else
    print 2
`,
[ 2 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
a = @testAction?
if a then {
    @testAction
    print 1
}
else
    print 2
`,
[ 1 ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
print("Test string");
`,
[ "Test string" ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
@SetGameSetting("AutomaticallyReturnToStage1", false)
@SetGameSetting("AutomaticallyGoToNextStage", false)
`,
[  ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
print(PlayerLevel)
`,
[ Zon.playerLevel.level.value ]
        ],
        [
`
Triggers: NONE_FOR_TESTING_ONLY
---------------------------------------------------------
//Empty program
`,
[  ]
        ],
//         [//Intentional error when trying to assign to a global value.
// `
// Triggers: NONE_FOR_TESTING_ONLY
// ---------------------------------------------------------
// Aether = 1
// //print(Aether);
// `,
// [  ]
//         ],
        ];

        const testCases = tests.map((test) => ScriptForge.ScriptTestCase.fromArray(test));
        ZonScript.sf.runTests(testCases, "ZonScript");

        console.log(`Running ScriptForge tests...`);

        ZonScript.sf.defineGetter('TestGlobalIterable', 'An iterable for testing foreach loops', () => { return [1, 2, 3, 4, 5]; });

        ZonScript.sf.defineTrigger('testTrigger', 'A test script trigger', []);
        const script = new ScriptForge.Script('ZonTestScript', metaDataTestProgramString, ZonScript.sf);
        ZonScript.sf.registerScript(metaDataTestProgramString);
        const testTrigger = ZonScript.sf.triggers.get('testTrigger');
        testTrigger.registerScript(`metaDataTestProgramScript`, script);
        ZonScript.sf.gf.execution.testMode = true;
        testTrigger.run();
        console.log(`Testing ScriptTrigger results: ${ZonScript.sf.gf.execution.testResults}`);
        ZonScript.sf.gf.execution.testResults.length = 0;
        ZonScript.sf.gf.execution.testMode = false;

        console.log("All ScriptForge tests completed.");
    }
}