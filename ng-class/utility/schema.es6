// Copyright (c) Alvin Pivowar 2016

function validateRequired(instance) {
    if (instance.schema.$required) {
        instance.schema.$required.forEach(propertyName => {
            if (!instance.obj.hasOwnProperty(propertyName))
                messages.push(`${propertyName} is required.`);
        });
    }
}

function validateRule(messages, obj, propertyName, ruleFn, message) {
    let result = ruleFn(obj, propertyName, message);

    if (result === true)
        return;

    if (result === false) {
        messages.push(message);
        return;
    }

    if (typeof(result) !== "string")
        throw new Error(`Validation: Property rule for ${propertyName} did not return a boolean or string.`);

    messages.push(result);
}

function validateRules(instance) {
    let rules = instance.schema.$rules || [];
    if (instance.schema.$rule)
        rules.push(instance.schema.$rule);

    for (let rule of rules) {
        let propertyName = rule.propertyName;
        if (typeof(propertyName) !== "string") throw new Error("Validation Rule: propertyName (string) is required.");

        let ruleFn = rule.ruleFn;
        if (typeof(ruleFn) != "function") throw new Error("Validation Rule: ruleFn (function) is required.");

        let message = rule.message;
        if (message && typeof(message) !== "string") throw new Error("Validation Rule: message must be string.");

        validateRule(instance.messages, instance.obj, propertyName, ruleFn, message);
    }
}

function validateType(messages, propertyName, schemaPropertyTypeRhs, objectPropertyValue) {
    let schemaPropertyTypes = [schemaPropertyTypeRhs];
    if (schemaPropertyTypeRhs.includes(" or ")) {
        let rhs = schemaPropertyTypeRhs.replace("or", ",");
        rhs = rhs.replace(/\s+/g, "");
        schemaPropertyTypes = rhs.split(",");
    }

    let match;
    for (let schemaPropertyType of schemaPropertyTypes) {
        match = false;
        switch (schemaPropertyType) {
            case "array":
                match = Array.isArray(objectPropertyValue);
                break;

            case "boolean":
            case "function":
            case "object":
            case "string":
                match = typeof(objectPropertyValue) === schemaPropertyType;
                break;
        }

        if (match)
            break;
    }

    if (!match)
        messages.push(`Property ${propertyName} must be ${schemaPropertyTypeRhs}.`);
}

function validateTypes(instance) {
    for (let propertyName in instance.obj) {
        if (instance.obj.hasOwnProperty(propertyName)) {
            let schemaPropertyTypeRhs = instance.schema[propertyName];
            let objectPropertyValue = instance.obj[propertyName];

            if (!schemaPropertyTypeRhs)
                messages.push(`Unknown property: ${propertyName}.`);
            else if (!(Object.is(null, objectPropertyValue) || Object.is(undefined, objectPropertyValue)))
                validateType(instance.messages, propertyName, schemaPropertyTypeRhs, objectPropertyValue);
        }
    }
}

class Schema {
    constructor(schema) {
        this.schema = schema;
    }

    validate(obj, dontThrow = false) {
        if (!obj) throw new Error("Schema.validate(): Nothing to validate.");
        if (typeof(obj) !== "object") throw new Error(`Schema.validate() - Expecting an object, was passed this: ${JSON.stringify(obj)}`);

        this.messages = [];
        this.obj = obj;

        validateTypes(this);
        validateRequired(this);
        validateRules(this);

        if (!this.messages.length)
            return true;

        if (dontThrow)
            return this.messages;

        let messages = this.messages.slice();
        messages.unshift(JSON.stringify(obj));
        throw new Error(JSON.stringify(messages));
    }
}

export default Schema;
