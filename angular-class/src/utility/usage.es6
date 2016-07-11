// Copyright (c) Alvin Pivowar 2016

class Usage {
    constructor(info) {
        this.info = info;
    }

    check(args) {
        let name = this.info.$name || "Usage";
        let result = [];

        let rule = this.findRule(args);
        let out = this.info.$out || rule.args;

        out.forEach(outParam => {
            let paramName = rule.args.find(inParam => inParam === outParam);
            if (paramName) {
                if (!this.info.hasOwnProperty(paramName))
                    throw new Error(`${name}: Usage info object missing type rule for ${paramName}.`);

                let param;
                for (let i = 0; i < rule.args.length; ++i) {
                    if (rule.args[i] === paramName)
                        param = args[i];
                }

                let typeRule = this.findTypeRule(paramName);
                this.evaluateTypeRule(param, paramName, typeRule);
                result.push(param);
            } else
                result.push(undefined);
        });

        return result;
    }

    evaluateTypeRule(param, paramName, typeRule) {
        let name = this.info.$name || "Usage";

        if (typeof(typeRule.rule) === "function") {
            if (!typeRule.rule(param)) {
                let message = typeRule.message || `Parameter "${paramName}" is incorrect type.`;
                throw new Error(`${name}: ${message}`);
            }

            return;
        }

        if (typeof(typeRule.rule) !== "string") {
            let message = typeRule.message || `Type rule for ${paramName} must be a string or function.`;
            throw new Error(`${name}: ${message}`);
        }

        let match;
        switch (typeRule.rule) {
            case "array":
                match = Array.isArray(param);
                break;

            case "boolean":
            case "function":
            case "object":
            case "string":
                match = typeof(param) === typeRule.rule;
                break;

            default:
                throw new Error(`Usage: Missing case for type rule ${typeRule}.`);
        }

        if (!match) {
            let message = typeRule.message || `Parameter "${paramName}" is not a ${typeRule}.`;
            throw new Error(`${name}: ${message}`);
        }
    }

    findRule(args) {
        const key = args.length.toString();
        let name = this.info.$name || "Usage";

        if (!this.info.hasOwnProperty(key)) {
            if (this.info.$name && this.info.$format)
                throw new Error(`usage: ${name}(${this.info.$format})`);
            else
                throw new Error(`${name}: parameter count ${key} not supported.`);
        }

        let rule = this.info[key];
        if (!rule) throw new Error(`${name}: Rule for parameter count ${key} missing.`);
        if (typeof(rule) === "string") rule = [rule];
        if (Array.isArray(rule)) rule = { args: rule };

        if (typeof(rule) !== "object" || !rule.args)
            throw new Error(`${name}: Unrecognized rule for parameter count ${key}.`);

        if (args.length != rule.args.length)
            throw new Error(`${name}: Rule for parameter count ${key} does not have ${key} args.`);

        return rule;
    }

    findTypeRule(paramName) {
        let name = this.info.$name || "Usage";

        if (!this.info.hasOwnProperty(paramName))
            throw new Error(`${name}: Usage info object missing type rule for ${paramName}.`);

        let typeRule = this.info[paramName];
        if (typeof(typeRule) !== "object") typeRule = { rule: typeRule };

        if (!typeRule.rule)
            throw new Error(`${name}: Type rule for ${paramName} is missing.`);

        return typeRule;
    }
}


export default Usage;