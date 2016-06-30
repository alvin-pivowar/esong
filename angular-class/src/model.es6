// Copyright (c) Alvin Pivowar 2016

import Usage from "./utility/usage.es6";

class InjectionHandler {
    constructor(moduleName) {
        let moduleList = ["ng"];
        if (moduleName) moduleList.push(moduleName);
        this.$injector = angular.injector(moduleList);
    }

    get(target, property, receiver) {
        if (!target[property]) {
            if (!this.$injector.has(property)) {
                const prototype = Object.getPrototypeOf(target);
                const constructor = prototype.constructor;
                throw new Error(`Unable to inject "${property}" into ${constructor.name}.`);
            }

            target[property] = this.$injector.get(property);
        }

        return Reflect.get(target, property, receiver);
    }
}


function addInjectionToModel(...args) {
    let [module, model] = new Usage({
        name: "addInjectionToModel",
        argFormat: "[module | moduleName], model",
        1: "model",
        2: ["module", "model"],
        module: {
            rule: item => typeof(item) === "string" || (typeof(item) === "object" && item.name),
            message: "module must be a module object or name of a module."
        },
        model: "function"
    }).check(args);

    let moduleName = typeof(module) === "object" ? module.name : module;
    return buildConstructorProxy(moduleName, model);
}

function buildConstructorProxy(moduleName, model) {
    return (...args) => {
        let instance = new model(...args);
        return new Proxy(instance, new InjectionHandler(moduleName));
    }
}


export default addInjectionToModel;