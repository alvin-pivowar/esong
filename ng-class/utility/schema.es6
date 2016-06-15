// Copyright (c) Alvin Pivowar 2016


class Schema {
    constructor(schema) {
        this.schema = schema;
    }

    validate(obj, dontThrow = false) {
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
                        case "string":
                            match = typeof(objectPropertyValue) === "string";
                            break;
                    }

                    if (!match)
                        messages.push(`Property ${propertyName} must be of type ${schemaPropertyType}.`);
                }
            }
        }

        // Check that the required properties are accounted for.
        if (this.schema["$required"]) {
            this.schema["$required"].forEach(propertyName => {
                if (!obj.hasOwnProperty(propertyName))
                    messages.push(`${propertyName} is required.`);
            });
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
