"use strict";

ZonScript.Documentation = {};

{
    const bold = (text) => `**${text}**`;
    const code = (text) => `\`${text}\``;
    const codeBlock = (text, language = 'js') => `\`\`\`${language}\n${text}\n\`\`\``;
    const header = (text, level = 1) => `${'#'.repeat(level)} ${text}`;
    const title = (text) => header(text, 1);
    const section = (text) => header(text, 2);
    const subsec = (text) => header(text, 3);
    const subsec2 = (text) => header(text, 4);
    const listSpaces = '    ';
    const list = (items) => {
        const listArr = [];
        for (const itemMaybeFunc of items) {
            let item = itemMaybeFunc;
            while (typeof item === 'function') {
                item = item();
            }

            if (Array.isArray(item)) {
                for (const subItem of item) {
                    listArr.push(listSpaces + getText(subItem));
                }
            }
            else {
                listArr.push(`- ${item}`);
            }
        }

        return listArr;
    }
    const link = (text, url) => `[${text}](${url})`;
    const image = (alt, url) => `![${alt}](${url})`;
    const quote = (text) => `> ${text}`;
    const tableByRows = (headers, rows) => {
        const headerRow = `| ${headers.join(' | ')} |`;
        const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');

        return `${headerRow}\n${separatorRow}\n${dataRows}`;
    };
    const tableByColumns = (headers, columns) => {
        const numRows = Math.max(...columns.map(col => col.length));
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            const row = columns.map(col => col[i] || '');
            rows.push(row);
        }

        return tableByRows(headers, rows);
    };
    const inlineMath = (text) => `$${text}$`;
    const blockMath = (text) => `$$\n${text}\n$$`;

    const intro = () => {
        return '' +
        title('ZonScript Documentation') + '\n' +
        `Welcome to the ZonScript documentation!\n` +
        `\n` +
        `ZonScript is a scripting language for interacting with and automating tasks in Zon.\n` +
        `My goal is to make this langage simple for anyone who knows the basics of any programming language without having to learn new syntax.\n` +
        `It accepts syntax from many different programming languages such as JavaScript, Python, C, C++, C#, Java, etc.`
        ;
    }

    const generalNotes = () => {
        return [
            section('General notes about syntax:'),
            subsec(`No Typing system:`),
            `ZonScript, similar to JavaScript and Python, does not have a typing system. This means that variables can hold values of any type and can be reassigned to different types without any issues.`,
            ``,
            subsec(`Loose Syntax:`),
            subsec2(`Accepts syntax from multiple languages: `),
            `ZonScript accepts syntax from many different programming languages including JavaScript, Python, C, C++, C#, Java, etc.`,
            `Some noteworthy exclusions are:`,
            list([
                `Python: Indentation based blocks are not supported. Use curly braces \`${code('{}')}\` instead.`,
                `C/C++/C#/Java: Types aren't supported, so you can't declare vairables with types. For example, \`${code('int x = 5;')}\` is not valid syntax, but \`${code('var x = 5;')}\`, \`${code('x = 5;')}\`, \`${code('let x = 5;')}\`, \`${code('const x = 5;')}\` are all valid and will declare a variable named \`x\` and assign it the value of \`5\`.`,
            ]),
            subsec2(`Declaring variables is optional:`),
            `Declaring variables before using them is optional, NOT required. You can simply assign a value to a variable name and it will be declared automatically. For instance, \`${code('let x = 5;')}\` and \`${code('x = 5;')}\` will both declare a variable named \`x\` and assign it the value of \`5\`. However, if you attempt to re-declare a variable that has already been delcared, it will throw an error. For example, ${code(`x = 5; let x = 10;`)}, will throw an error.`,
            subsec2(`Semicolons are optional:`),
            `Semicolons at the end of statements are optional. You can write \`${code('x = 5;')}\` or \`${code('x = 5')}\`, both will work just fine. However, if you choose not to use semicolons, make sure there is a space or newline between statements.`,
            ``,
            subsec(`Limited functionality:`),
            `Many advanced features of programming languages such as for loops, while loops and loops, classes. are not supported in ZonScript. This is because ZonScript is designed to be a simple scripting language for automating tasks in Zon, not a general purpose programming language. However, I may add more features in the future based on user feedback and demand.`,
            `Functionallity that is included:`,
            list([
                `Variable declaration and assignment: a = 5`,
                `Printing to the console (F12 DevTools console) using \`${code('print(s)')}\` where s is a string.`,
                `Mathematical operations:`,
                list([
                    `Addition (+): a + b`,
                    `Subtraction (-): a - b`,
                    `Multiplication (*): a * b`,
                    `Division (/): a / b`,
                    `Exponents (^): a ^ b`,
                    `Parentheses for grouping: (a + b) * c`,
                    `Modulo (%): a % b`,
                    `logs: log(value) Example: log(100) = 2, log(value, base) Example: log(8, 2) = 3, log{base}(value) Example: log2(8) = 3, ln(value)`,
                    `Increment and decrement (both pre and post) a++, ++a, a--, --a`,
                    `(e and pi are NOT included as built in constants. You can define them yourself if you want: e = 2.718281828459; pi = 3.14159265359;)`,
                    `Comparison operators: ==, !=, >, <, >=, <= Example: 5 > 3 will evaluate to true, 5 == 5 will evaluate to true, 5 != 5 will evaluate to false`,
                    `Logical operators: && (and), || (or), ! (not) Example: (5 > 3) && (2 < 4) will evaluate to true, (5 > 3) || (2 > 4) will evaluate to true, !(5 > 3) will evaluate to false`,
                    `Rounding functions:`,
                    list([
                        `round(value) - Rounds to the nearest integer.         round(3.2) -> 3, round(3.5) -> 4, round(3.9) -> 4, round(-3.2) -> -3, round(-3.5) -> -4, round(-3.9) -> -4`,
                        `floor(value) - Rounds down towards negative infinity. floor(3.2) -> 3, floor(3.5) -> 3, floor(3.9) -> 3, floor(-3.2) -> -4, floor(-3.5) -> -4, floor(-3.9) -> -4`,
                        `ceil(value)  - Rounds up towards positive infinity.   ceil(3.2)  -> 4, ceil(3.5)  -> 4, ceil(3.9)  -> 4, ceil(-3.2)  -> -3, ceil(-3.5)  -> -3, ceil(-3.9)  -> -3`,
                        `trunc(value) - Rounds towards zero.                   trunc(3.2) -> 3, trunc(3.5) -> 3, trunc(3.9) -> 3, trunc(-3.2) -> -3, trunc(-3.5) -> -3, trunc(-3.9) -> -3`,
                    ]),
                ]),
                `Boolean logic, operators, and values:`,
                list([
                    `if else statements: if (condition) { ... } else { ... }, else is optional. Valid Examples: ${code(`if (x > 5) print("greater")`)}, and ${code(`if (x > 5) print("greater") else print("not greater")`)} are both valid.`,
                    `Ternary operator: condition ? valueIfTrue : valueIfFalse Example: ${code(`let result = (x > 5) ? "greater" : "not greater";`)}`,
                    `Comparison operators: ==, !=, >, <, >=, <= Example: 5 > 3 will evaluate to true, 5 == 5 will evaluate to true, 5 != 5 will evaluate to false`,
                    `Logical operators: && (and), || (or), ! (not) Example: (5 > 3) && (2 < 4) will evaluate to true, (5 > 3) || (2 > 4) will evaluate to true, !(5 > 3) will evaluate to false`,
                    `Boolean values: true and false`,
                ]),
                `Block scopes using curly braces, { ... }: Blocks are groups of statements wrapped with curly braces. They create a new variable scope, meaning that variables declared inside the block are deleted at the end of the block.  You can use blocks in multiple different places.  The most common are in if else statements.  You can do an if else statment without blocks, but can only have 1 statement for the if and 1 statement for the else. If you want multiple statements, you must use a block. For example, this is valid syntax: ${code(`if (x > 5) print("greater"); else print("not greater");`)}. However, if you want to execute multiple statements for the if and else, you must use blocks like this: ${code(`if (x > 5) { print("greater"); print("big"); } else { print("not greater"); print("small"); }`)}`,
                `Comments: // for single line comments, # for single line comments, /* ... */ for multi line comments. Comments are completely ignored.  They are for adding notes to code.`,
                `Functions: You can define functions using the syntax: functionName(parameters) { ... } where functionName is the name of the function, parameters is a comma separated list of parameter names, and ... is the code that runs when the function is called. For example: ${code(`function add(a, b) { return a + b; }`)}.  Functions are stored as local variables, so the same rules apply for variables.`,
            ]),
        ];
    }

    const zonScriptDetails = () => {
        return [
            section('ZonScript Details (How to make ZonScript do something in Zon):'),
            subsec(`Summary:`),
            `ZonScript has 3 main features, triggers, actions, and getters. These allow you to run scripts when important events happen in Zon, check for certain conditions, and interact with Zon in various ways. You can use these features to automate tasks in Zon, create custom interactions, and much more!`,
            subsec(`Triggers:`),
            `Triggers are various events that occur in Zon such as 'on gain Aether', 'on reset core enhancement points', 'once per second', etc. When an even happens, it will run all scripts that have the trigger's name in their Triggers list. This will be discussed more in the 'Writing a Script' section when discussing Script Metadata.`,
            subsec(`Actions:`),
            `Actions are things that you can make Zon do, such as purchasing upgrades, resetting points, changing settings, modifying assembler tasks, etc. You can use actions in your scripts to interact with Zon and automate tasks. Discussed more in the 'Writing a Script' section.`,
            subsec(`Getters:`),
            `Getters are values in Zon that you can access in a script, such as the amount of Aether you have, the cost of an upgrade, the level of an upgrade, current task of an assembler, etc. You can use getters in your scripts to check for certain conditions and make decisions based on those conditions. Discussed more in the 'Writing a Script' section.`,
        ];
    }

    const writingAScript = () => {
        const metaArr = [];
        for (let i = 0; i < ScriptForge.Script.metaDescriptions.length; i++) {
            const metaLabel = ScriptForge.Script.metaLabels[i];
            const metaDesc = ScriptForge.Script.metaDescriptions[i];
            metaArr.push(`${bold(metaLabel)}: ${metaDesc}`);
        }

        return [
            section('Writing a Script:'),
            `Scripts are written in a simple text format with 3 main sections, metadata, the line break ("---"), and code.`,
            subsec(`Metadata:`),
            `Metadata is information about the script. Some is just informational, and some is functional. Some parts of the Metadata are REQUIRED such as the Triggers list.`,
            `Sections of Metadata:`,
            list(metaArr),
            `A list of all available Trigger names is located in the 'Triggers' section.`,
            subsec(`The line break ("---"):`),
            `The line break is just 3 or more hyphens, "---". It goes after the Metadata and before the code to seperate them.`,
            subsec(`Code:`),
            `The code section is where you write the functional code for the script.`,
            subsec(`Example Script:`),
            subsec2(`Without comments, just the script:`),
            codeBlock(`
Title: Always Empower Combat Core
Description: Tries to empower the combat core every time you gain Aether.
Author: Andro951
Version: 1.0.0
Triggers: OnGainAether
---
print("AetherGained: " + AetherGained + ", total Aether: " + Aether + " Trying to empower combat core...")

if (@TryEmpowerCore("Combat")?)
    @TryEmpowerCore("Combat")

print("total Aether after trying to empower: " + Aether)
`,
            'js'),
            subsec2(`With comments explaining what each part does:`),
            codeBlock(`
Title: Always Empower Combat Core
Description: Tries to empower the combat core every time you gain Aether.
Author: Andro951
Version: 1.0.0
Triggers: OnGainAether
---

//Some triggers set some variables automatically, so they are available to use in the script.
//OnGainAether provides some such as 'AetherGained'. It is a variable, not a Getter.

//This just prints how much Aether was gained from completing the leve, and the total Aether before trying to empower.
print("AetherGained: " + AetherGained + ", total Aether: " + Aether + " Trying to empower combat core...")

//Aether is a getter.  It gets the current amount of Aether you have. All you do to get the value of a getter is use its name like it's a variable.
// However, you can't set the value of a getter. Trying to set a value to a getter will throw an error. For example, Aether = 100; will throw an error because Aether is a getter and you can't set it to a value. Getters are read only.
//AetherGained is not a getter. It is a variable that is automatically set before your script is run by the OnGainAether trigger. You can set the value of these variables, but it is not recommended. 
// For instance, AetherGained = 100, is allowed, but you won't be able to get the original value of AetherGained. Also, these values are just copies, so setting them won't affect the game. Nice try though =b.


//This attempts to empower the core.
//TryEmpowerCore is the name of the action being used. "Combat" is the an argument being passed to the action to specify which core to empower.
//@ must be used to indicate that the next part is an action.
//@TryEmpowerCore("Combat") is the action.
//Adding a ? after the action changes it from an action to a check to see if the action is available.
// For instance, to empower a core, you must first have the core unlocked. @TryEmpowerCore("Combat")? will tell you if you are allowed to attempt the action, @TryEmpowerCore("Combat").
//However, you don't have to use the @TryEmpowerCore("Combat")? check. If you attempt to use @TryEmpowerCore("Combat") when it's not available, it will just do nothing.
// The checks are there to help you figure out why an action might not be working.
if (@TryEmpowerCore("Combat")?)
    @TryEmpowerCore("Combat")

//Prints the total Aether after trying to empower, so you can see if it spent any Aether.
print("total Aether after trying to empower: " + Aether)
`,
            'js'),
        ];
    }

    const triggers = () => {
        const innerArr = [...ZonScript.sf.triggers.values()].map(trigger => [
            bold(`${trigger}`) + `  \nDescription: ${trigger.description}  \nVariables provided by this trigger:`,
            list(trigger.parameters.map(param => `${param}`)),
        ]);
        
        return [
            section('Triggers:'),
            `Triggers are events that run scripts when they happen. For example, the 'OnGainAether' trigger runs scripts when you gain Aether.`,
            subsec(`All Triggers:`),
            list(innerArr.flat()),
        ];
    }

    const actions = () => {
        return [
            section('Actions:'),
            `Actions are things that you can make Zon do, such as purchasing upgrades, resetting points, changing settings, modifying assembler tasks, etc. You can use actions in your scripts to interact with Zon and automate tasks.`,
            subsec(`All Actions:`),
            list([...ZonScript.sf.scriptActions.values()].map(action => [
                bold(`${action}`) + `  \nDescription: ${action.description}  \nParameters:`,
                list(action.parameters.map(param => `${param}`)),
            ]).flat()),
        ];
    }

    const getters = () => {
        return [
            section('Getters:'),
            `Getters are values in Zon that you can access in a script, such as the amount of Aether you have, the cost of an upgrade, the level of an upgrade, current task of an assembler, etc. You can use getters in your scripts to check for certain conditions and make decisions based on those conditions.`,
            subsec(`All Getters:`),
            list([...ZonScript.sf.allGetters.values()].map(getter => bold(getter.name) + ': ' + getter.description)),
        ];
    }

    ZonScript.Documentation._documentation = null;

    const getText = (textItem) => {
        const type = typeof textItem;
        switch (type) {
            case 'function':
                return getText(textItem());
            case 'string':
                return textItem;
            default:
                if (!Array.isArray(textItem))
                    throw new Error(`Invalid textItem type: ${type}. Must be a string, an array of strings, or a function that returns a string or an array of strings.`);

                const textArr = [];
                for (const item of textItem) {
                    textArr.push(getText(item));
                }

                return textArr.join('\n');
        }
    }

    ZonScript.Documentation.getDocumentation = () => {
        if (!ZonScript.Documentation._documentation) {
            const doc = [];
            doc.push(getText(intro));
            doc.push(getText(generalNotes));
            doc.push(getText(zonScriptDetails));
            doc.push(getText(writingAScript));
            doc.push(getText(triggers));
            doc.push(getText(actions));
            doc.push(getText(getters));

            ZonScript.Documentation._documentation = doc.join('\n\n');
        }

        return ZonScript.Documentation._documentation;
    }

    ZonScript.Documentation.openInNewTab = () => {
        const text = ZonScript.Documentation.getDocumentation();
        
        if (zonDebug) {
            //ZonScript.Documentation.downloadAsMarkdown();
        }

        if (!marked) {
            Zon.warning(`Marked library did not finish loading.  Please try again in a few seconds. If the problem persists, please report this to the developer.`);
            return;
        }

        const html = marked.parse(text);
        const win = window.open();
        if (!win) {
            Zon.warning(`Failed to open documentation in new tab. Please allow popups for this site and try again.`);
            return;
        }

        win.document.documentElement.innerHTML = `
        <html>
        <head>
        <title>ZonScript Documentation</title>
        <meta charset="UTF-8">
        </head>
        <body>
        ${html}
        </body>
        </html>
        `;
    }

    ZonScript.Documentation.downloadAsMarkdown = () => {
        const text = ZonScript.Documentation.getDocumentation();

        const blob = new Blob([text], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `ZonScript_Documentation_${Zon.version}.md`;
        a.click();

        URL.revokeObjectURL(url);
    }
}