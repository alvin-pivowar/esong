// Copyright (c) Alvin Pivowar 2016ls

import Enum from "./enum.es6";

const DependencyItemType = new Enum({
    Name: 1,
    Module: 2,
    ngModule: 3
});


function getDependencyItemType(item) {
    if (!item) return undefined;
    if (typeof(item) === "string") return DependencyItemType.Name;
    if (typeof(item) !== "object") return undefined;
    if (item.hasOwnProperty("provider") && item.hasOwnProperty("name")) return DependencyItemType.ngModule;
    if (item.constructor.isModule && item.constructor.isModule(item)) return DependencyItemType.Module;

    return undefined;
}

class DependencyItem {
    constructor(item) {
        this.item = item;
        this.type = getDependencyItemType(item);
    }

    get name() {
        switch (this.type) {
            case DependencyItemType.Name:
                return this.item;
            case DependencyItemType.Module:
            case DependencyItemType.ngModule:
                return this.item.name;
            default:
                return undefined;
        }
    }
}

class InjectionItem {
    get hasNamespace() { return this.item.includes('.'); }

    constructor(item) {
        this.item = item;
    }

    namespaceQualifiedName(module) {
        // If the item is already qualified with a namespace, use it.
        if (this.hasNamespace) return this.item;

        // If the item is prefaced with a '$', then it is an Angular service.
        if (this.item.startsWith('$')) return this.item;

        // If the item is prefaced with a '.' (empty namespace), then don't use a namespace.
        if (this.item.startsWith('.')) return this.item.substring(1);

        // Otherwise, we will assume that the caller is injecting a local name from the current module.
        // Use a namespace if the module uses namespaces.
        return module.hasNamespace ? `${module.namespace}.${this.item}` : this.item;
    }
}


// The input array can consist of strings, ngClass modules, and angular modules
// The output array will be strings.
function buildDependencyArray(inputArray) {
    let outputArray = [];

    for (let raw of inputArray) {
        let item = new DependencyItem(raw);
        if (!item.type)
            throw new Error(`Dependency array malformed: ${JSON.stringify(inputArray)}`);

        outputArray.push(item.name);
    }

    return outputArray;
}

// module is the ngCalls module instance.  It is required for namespacing.
// constructor is derived from one of the ngClass recipe factories.
// Note that this class must have a static named $inject.  This can be manually created, or auto-created by using the
// @ngInject decorator.
// The output is a set of strings.
function buildInjectionArray(module, derivedConstructor, recipeFn = null) {
    if (derivedConstructor.length > 0 && ! derivedConstructor.$inject)
        throw new Error(`${derivedConstructor.name}: Injection information missing. Did you forget @ngInject?`);

    if (derivedConstructor.length > 0 && derivedConstructor.length != derivedConstructor.$inject.length)
        throw new Error(`${derivedConstructor.name}: Length mismatch between derived constructor and $inject`);

    let outputArray = [];
    for (let raw of derivedConstructor.$inject) {
        let item = new InjectionItem(raw);
        outputArray.push(item.namespaceQualifiedName(module));
    }

    if (recipeFn)
        outputArray.push(recipeFn);

    return outputArray;
}

export {
    DependencyItem,
    DependencyItemType,
    InjectionItem,
    buildDependencyArray,
    buildInjectionArray
};
