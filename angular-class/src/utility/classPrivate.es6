// Copyright (c) Alvin Pivowar 2016

class ClassPrivate {
    constructor(enumObj) {
        this.map = new WeakMap();
        return [this, enumObj];
    }

    get(instance, enumItem) {
        const map = this.map.get(instance);
        if (!map) return undefined;

        return map.has(enumItem.key) ? map.get(enumItem.key) : undefined;
    }

    set(instance, enumItem, value) {
        if (!this.map.has(instance))
            this.map.set(instance, new Map());

        const map = this.map.get(instance);
        map.set(enumItem.key, value);
    }
}

export default ClassPrivate;