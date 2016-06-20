// Copyright (c) Alvin Pivowar 2016


class Schema {
    constructor(schema) {
        this.schema = schema;
    }

    validate(obj, dontThrow = false) {
        if (!obj) throw new Error("Schema.validate(): Nothing to validate.");
        if (typeof(obj) !== "object") throw new Error(`Schema.validate() - Expecting an object, was passed this: ${JSON.stringify(obj)}`);

        let messages = [];

        // Check that each property in the subject has an entry in the schema, and it is of the proper type.
        for (let propertyName in obj) {
            if (obj.hasOwnProperty(propertyName)) {
                let schemaPropertyType = this.schema[propertyName];
                let objectPropertyValue = obj[propertyName];

                if (!schemaPropertyType)
                    messages.push(`Unknown property: ${propertyName}.`);
                else if (!(Object.is(null, objectPropertyValue) || Object.is(undefined, objectPropertyValue))) {
                    let match = false;
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

                    if (!match)
                        messages.push(`Property ${propertyName} must be of type ${schemaPropertyType}.`);
                }
            }
        }

        // Check that the required properties are accounted for.
        if (this.schema.$required) {
            this.schema.$required.forEach(propertyName => {
                if (!obj.hasOwnProperty(propertyName))
                    messages.push(`${propertyName} is required.`);
            });
        }

        // $one
        if (this.schema.$one) {
            if (!Array.isArray(this.schema.$one)) throw new Error("$one must be an array of arrays.");

            for (let currentOne of this.schema.$one) {
                if (!Array.isArray(currentOne)) throw new Error("$one must be an array of arrays.");

                let count = 0;
                for (let item of currentOne) {
                    if (obj.hasOwnProperty(item)) ++count;
                }

                if (count === 0)
                    throw new Error(`One of ${JSON.stringify(currentOne)} must be provided.`);

                if (count > 1)
                    throw new Error(`Only one of ${JSON.stringify(currentOne)} can be specified.`);
            }
        }

        if (!messages.length)
            return true;

        if (dontThrow)
            return messages;

        messages.unshift(JSON.stringify(obj));
        throw new Error(JSON.stringify(messages));
    }
}

export default Schema;
