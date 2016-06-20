// Copyright (c) Alvin Pivowar 2016

import {ConfigBlock, RunBlock} from "./blocks.es6";
import Controller from "./controller.es6";
import Provider from "./provider.es6";
import Factory from "./factory.es6";
import Schema from "./utility/schema.es6";
import Service from "./service.es6";

import {buildDependencyArray, buildRecipeName} from "./utility/di.es6";


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


const ngModules = new WeakMap();

class Module {
    get hasNamespace() { return !Object.is(undefined, this[MODULE_SYMBOL].namespace); }
    get info() { return this[MODULE_SYMBOL]; }
    get name() { return this[MODULE_SYMBOL].name; }
    get namespace() { return this[MODULE_SYMBOL].namespace; }
    get ngModule() { return ngModules.get(this); }

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

        ngModules.set(this, register(this));
    }

    get Config() { return ConfigBlock(this); }
    get Controller() { return Controller(this); }
    get Factory() { return Factory(this); }
    get Provider() { return Provider(this); }
    get Run() { return RunBlock(this); }
    get Service() { return Service(this); }

    constant(rawConstantName, constantObj) {
        if (typeof(rawConstantName) !== "string") throw new Error("module.constant(): name (string) required.");
        if (!constantObj) throw new Error("module.constant(): constant required.");

        angular.module(this.info.name).constant(buildRecipeName(this, null, rawConstantName), constantObj);
    }

    value(rawValueName, valueObj) {
        if (typeof(rawValueName) !== "string") throw new Error("module.value(): name (string) required.");
        if (!valueObj) throw new Error("module.value(): value required.");

        angular.module(this.info.name).value(buildRecipeName(this, null, rawValueName), valueObj);
    }


    static isModule(obj) {
        return !!Object.getOwnPropertySymbols(obj).find(s => s === MODULE_SYMBOL);
    }

    static register() {
        return new this();
    }
}

export default Module;
