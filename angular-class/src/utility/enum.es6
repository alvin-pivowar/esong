// Copyright (c) Alvin Pivowar 2016

const ENUM_FLAG_SYMBOL = Symbol();

// This is the actual enum class,
// the class named "Enum" is a factory for this class.

const _parsedItems = new WeakMap();

class _enum {
    constructor(isFlags) {
        if (isFlags)
            this[ENUM_FLAG_SYMBOL] = true;
        _parsedItems.set(this, new Map());
    }

    * [Symbol.iterator]() { yield* this.entries(); }

    * entries() {
        for (let property in this) {
            if (this.hasOwnProperty(property)) {
                yield [this[property].key, this[property].value];
            }
        }
    }

    * keys() {
        for (let property in this) {
            if (this.hasOwnProperty(property))
                yield this[property].key;
        }
    }

    * values() {
        for (let property in this) {
            if (this.hasOwnProperty(property))
                yield this[property].value;
        }
    }

    forEach(fn) {
        let index = 0;
        for (let property in this) {
            if (this.hasOwnProperty(property))
                fn([this[property].key, this[property].value], index++, this);
        }
    }
}

class Enum {
    static get flags() { return ENUM_FLAG_SYMBOL; }

    constructor(obj) {
        if (!obj) throw new Error("enum object is required.");

        let result = new _enum(Enum.isFlagEnum(obj));
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                result[property] = {
                    id: Symbol(),
                    key: property,
                    value: obj[property],

                    toString: λ => property
                };
            }
        }

        return result;
    }

    static isFlagEnum(enumObj) {
        return !!Object.getOwnPropertySymbols(enumObj).find(s => s === ENUM_FLAG_SYMBOL);
    }

    static parse(enumObj, text) {
        let [success, item] = Enum.tryParse(enumObj, text);
        if (!success) {
            let msg = (typeof(item) === "string") ? item : `'${text}' is not a valid key for the specified enum.`;
            throw new Error(msg);
        }

        return item;
    }

    static toString(enumObj, value) {
        if (!enumObj) return [false, "enumObj is required."];
        if (enumObj.constructor.name != "_enum") return [false, "enumObj must be an enum."];
        if (!value) return [false, "value is required."];

        for (let property in enumObj) {
            if (enumObj.hasOwnProperty(property) && enumObj[property].value === value)
                return enumObj[property].key;
        }

        if (Enum.isFlagEnum(enumObj)) {
            const isPowerOfTwo = n => (n !== 0) && ((n & (n - 1)) === 0);

            let result = "";
            for (let property in enumObj) {
                if (enumObj.hasOwnProperty(property) &&
                    isPowerOfTwo(enumObj[property].value) &&
                    (enumObj[property].value & value) !== 0) {

                    if (result.length > 0) result += ',';
                    result += enumObj[property].key;
                }
            }

            if (result)
                return result;
        }

        return undefined;
    }

    static tryParse(enumObj, text) {
        if (!enumObj) return [false, "enumObj is required."];
        if (enumObj.constructor.name != "_enum") return [false, "enumObj must be an enum."];
        if (!text) return [false, "text is required."];

        for (let property in enumObj) {
            if (enumObj.hasOwnProperty(property) && enumObj[property].key === text)
                return [true, enumObj[property]];
        }

        if (Enum.isFlagEnum(enumObj)) {
            let result = 0;
            for (let key of text.split(',')) {
                for (let property in enumObj) {
                    if (enumObj.hasOwnProperty(property) && enumObj[property].key === key)
                        result |= enumObj[property].value;
                }
            }

            if (result) {
                let key = Enum.toString(enumObj, result);

                if (!_parsedItems.get(enumObj).has(result)) {
                    _parsedItems.get(enumObj).set(result, {
                        id: Symbol(),
                        key: key,
                        value: result,

                        toString: λ => key
                    });
                }

                return [true, _parsedItems.get(enumObj).get(result)];
            }
        }

        return [false, undefined];
    }
}

export default Enum;
