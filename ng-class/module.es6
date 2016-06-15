// Copyright (c) Alvin Pivowar 2016

import ClassPrivate from "./utility/classPrivate.es6";
import ConfigBlock from "./configBlock.es6";
import Controller from "./controller.es6";
import Enum from "./utility/enum.es6";
import RunBlock from "./runBlock.es6";
import Schema from "./utility/schema.es6";

import {buildDependencyArray} from "./utility/di.es6";

const MODULE_SYMBOL = Symbol();

const moduleSchema = new Schema({
    dependencies: "array",
    name: "string",
    namespace: "string",
    $required: ["dependencies", "name"]
});


// Register the module with angular.
function register(module) {
    let info = module[MODULE_SYMBOL];
    let name = info.name;
    let dependencies = buildDependencyArray(info.dependencies);

    return angular.module(name, dependencies);
}


const [modulePrivate, ModulePrivateProperties] = new ClassPrivate(new Enum({
    ngModule: 1
}));

class Module {
    get hasNamespace() { return !Object.is(undefined, this[MODULE_SYMBOL].namespace); }
    get info() { return this[MODULE_SYMBOL]; }
    get name() { return this[MODULE_SYMBOL].name; }
    get namespace() { return this[MODULE_SYMBOL].namespace; }
    get ngModule() { return modulePrivate.get(this, ModulePrivateProperties.ngModule); }

    constructor(moduleInfo) {
        const derivedClass = this.constructor;
        if (derivedClass.name === "Module") throw new Error("Module class is abstract, use derivation.");
        if (!moduleInfo) throw new Error("moduleInfo missing.");

        this[MODULE_SYMBOL] = moduleInfo;

        moduleSchema.validate(moduleInfo);

        // If the namespace is missing but not undefined,
        // then the default namespace is the module name.
        if (!moduleInfo.namespace) {
            let hasNamespace = !(moduleInfo.hasOwnProperty("namespace") && Object.is(undefined, moduleInfo.namespace));
            if (hasNamespace)
                moduleInfo.namespace = moduleInfo.name;
        }

        modulePrivate.set(this, ModulePrivateProperties.ngModule, register(this));
    }

    get Config() { return ConfigBlock(this); }
    get Controller() { return Controller(this); }
    get Run() { return RunBlock(this); }

    static isModule(obj) {
        return !!Object.getOwnPropertySymbols(obj).find(s => s === MODULE_SYMBOL);
    }
}

export default Module;
