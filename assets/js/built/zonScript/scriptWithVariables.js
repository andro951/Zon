"use strict";

ZonScript.ScriptWithVariables = class ScriptWithVariables extends ScriptForge.Script {
    constructor(...args) {
        super(...args);
        
        this.usedActions = new Set();
        const tryFunc = () => {
            this.collectActionsUsed();
            this.checkForDisallowedActions();
        }

        if (this.sf.disableTryCatch) {
            tryFunc();
        }
        else {
            try {
                tryFunc();
            }
            catch (e) {
                this._enabled = false;
                this.error = e.toString();
            }
        }

        this._error = new Variable.Value(null, `${this.key}ErrorText`);
        this._error.value = this.error;
        Object.defineProperty(this, 'error', {
            get() {
                return this._error.value;
            },
            set(value) {
                this._error.value = value;
            },
            configurable: true,
            enumerable: true
            }
        );

        this.__enabled = new Variable.Value(true, `${this.key}__Enabled`);
        this.__enabled.value = this._enabled;

        this.enabledDependent = new Variable.Dependent(() => this._error.value ? false : this.__enabled.value, `${this.key}EnabledDependent`, {this: this});

        Object.defineProperty(this, `enabled`, {
            get() {
                return this.enabledDependent.value;
            },
            set(value) {
                //Do nothing.
                //ScriptForge will set this redundantly when setting _enabled and error.
            },
            configurable: true,
            enumerable: true
        });

        Object.defineProperty(this, `_enabled`, {
            get() {
                return this.__enabled.value;
            },
            set(value) {
                this.__enabled.value = value;
            },
            configurable: true,
            enumerable: true
        });
    }
    collectActionsUsed() {
        if (!this.ast)
            return;

        this.collectActionsFromNode(this.ast);
    }
    collectActionsFromArray(arr) {
        for (const item of arr) {
            if (Array.isArray(item)) {
                this.collectActionsFromArray(item);
            }
            else if (item instanceof GrammarForge.AstNode) {
                this.collectActionsFromNode(item);
            }
            else {
                throw new Error(`Expected item to be an array or instance of GrammarForge.AstNode in collectActionsFromArray for ${this.key} (Script), but got ${typeof item} instead.`);
            }
        }
    }
    collectActionsFromNode(node) {
        // action      : ATSYM NAME (LPAREN (exp (COMMA? exp)*)? RPAREN)?
        // act_avail   : ATSYM NAME (LPAREN (exp (COMMA? exp)*)? RPAREN)? (AVAILABLE | QUESTION)
        if (!(node instanceof GrammarForge.AstNode))
            throw new Error(`Expected node to be an instance of GrammarForge.AstNode in collectActionsFromNode for ${this.key} (Script), but got ${typeof node} instead.`);

        if (node instanceof GrammarForge.ExpNode) {
            const rule = node.expression.rule;
            if (rule !== null) {
                if (rule.name === "action" || rule.name === "act_avail") {
                    const [ nameNode, optionalNode ] = node.nodes;
                    if (!(nameNode instanceof GrammarForge.TokenNode) || nameNode.type !== "NAME")
                        throw new Error(`Expected nameNode to be a TokenNode with type "NAME" in collectActionsFromNode for ${this.key} (Script), but got ${nameNode.constructor.name} instead.`);

                    const actionName = nameNode.value;
                    this.usedActions.add(actionName);
                    return;
                }
            }
            
            if (Array.isArray(node.nodes)) {
                this.collectActionsFromArray(node.nodes);
            }
            else {
                this.collectActionsFromNode(node.nodes);
            }
        }

        

        // const [nodeType, expListNode] = node;
        // if (typeof nodeType === 'string') {
        //     if (Array.isArray(expListNode)) {
        //         const [expListType, expNode, expressionNode] = expListNode;
        //         if (expListType === "EXPLIST" && Array.isArray(expNode) && Array.isArray(expressionNode)) {
        //             const [expressionType, expressionIndex, expressionString] = expressionNode;
        //             const [expType, expInnerNode, expLengthNode] = expNode;
        //             if (expType === "EXP" && Array.isArray(expInnerNode) && Array.isArray(expLengthNode) && expressionType === "EXPRESSION") {
        //                 const [ATSYM, NAME, qWord] = expInnerNode;
        //                 if (Array.isArray(ATSYM) && Array.isArray(NAME) && Array.isArray(qWord)) {
        //                     const [atsymTerm, atsymNode, atsymToken] = ATSYM;
        //                     const [nameTerm, nameNode, nameToken] = NAME;
        //                     const [qWordType, qWordExpListNode, qWordOpType] = qWord;
        //                     if (atsymTerm === "TERM" && Array.isArray(atsymNode) && atsymToken === "TOKEN" &&
        //                         nameTerm === "TERM" && Array.isArray(nameNode) && nameToken === "TOKEN" &&
        //                         qWordType === "QWORD" && Array.isArray(qWordExpListNode) && qWordOpType === "QUESTION") {
                                
        //                         const [atsymTokenType, atsymType, atsymString] = atsymNode;
        //                         const [nameTokenType, nameType, nameString] = nameNode;
        //                         if (atsymTokenType === "TOKEN" && atsymType === "ATSYM" && typeof atsymString === "string" &&
        //                             nameTokenType === "TOKEN" && nameType === "NAME" && typeof nameString === "string") {

        //                             // action      : ATSYM NAME (LPAREN (exp (COMMA? exp)*)? RPAREN)?
        //                             // act_avail   : ATSYM NAME (LPAREN (exp (COMMA? exp)*)? RPAREN)? (AVAILABLE | QUESTION)
        //                             const action = ZonScript.sf.scriptActions.get(nameString);
        //                             if (!action)
        //                                 throw new Error(`Unknown action ${nameString} used in script ${this.key}.`);

        //                             this.usedActions.add(nameString);
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        // for (const child of node) {
        //     if (Array.isArray(child))
        //         this.collectActionsFromNode(child);
        // }
    }
    checkForDisallowedActions() {
        for (const triggerName of this.triggers) {
            const trigger = ZonScript.sf.triggers.get(triggerName);
            if (!trigger)
                continue;

            const disallowedActionsSet = trigger.disallowedActions;
            for (const actionName of disallowedActionsSet) {
                if (this.usedActions.has(actionName))
                    throw new Error(`The action, ${actionName}, is not allowed to be used in the trigger ${triggerName}.`);
            }
        }
    }
}

ZonScript.registerScriptFromText = (key, scriptText, registerWithTriggers = false) => {
    const script = new ZonScript.ScriptWithVariables(key, scriptText, ZonScript.sf);
    return ZonScript.sf.registerScript(script, registerWithTriggers);
}