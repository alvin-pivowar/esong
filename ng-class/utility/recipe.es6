// Copyright (c) Alvin Pivowar 2016

import ClassPrivate from "./classPrivate.es6";
import Enum from "./enum.es6";
import {buildInjectionArray, buildRecipeName} from "./di.es6";

const RECIPE_TYPE_SYMBOL = Symbol();

const RecipePrivatePropertyType = new Enum({
    info: 1,
    ngInstance: 2,
    ngRegistrationObj : 3,
    runtimeObject: 4
});

const RecipeType = new Enum({
    ConfigBlock: 1,
    Component: 2,
    Controller: 3,
    Directive: 4,
    Factory: 5,
    Provider: 6,
    RunBlock: 7,
    Service: 8
});


class RecipeHelper {
    constructor (module, derivedClass) {
        this.module = module;
        this.derivedClass = derivedClass;
    }

    buildInjectionArray() {return buildInjectionArray(this.module, this.derivedClass, this.buildProxy()); }

    buildProxy() {
        let derivedClass = this.derivedClass;
        let proxyFn = (...args) => {
            derivedClass[RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL] = true;
            let instance = new derivedClass(...args);
            delete derivedClass[RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL];

            // Copy injected items onto instance.
            if (derivedClass.$inject) {
                for (let i = 0; i < derivedClass.$inject.length; ++i) {
                    instance[derivedClass.$inject[i]] = args[i];
                }
            }

            if (instance[RECIPE_TYPE_SYMBOL] === RecipeType.Controller && typeof((instance.init)) === "function")
                instance.init();

            return instance;
        };


        proxyFn[RecipeHelper.PROXY_FUNCTION_SYMBOL] = true;
        return proxyFn;
    }

    buildRecipeName(rawRecipeName) { return buildRecipeName(this.module, this.derivedClass, rawRecipeName); }

    getInfo() { return recipeBasePrivate.get(this.derivedClass, RecipePrivatePropertyType.info); }

    getInstanceObj(instance) {
        let key = instance ? instance : this.derivedClass;
        return recipeBasePrivate.get(key, RecipePrivatePropertyType.ngInstance);
    }

    getRegistrationObj() { return recipeBasePrivate.get(this.derivedClass, RecipePrivatePropertyType.ngRegistrationObj); }

    getRuntimeObject() { return recipeBasePrivate.get(this.derivedClass, RecipePrivatePropertyType.runtimeObject); }


    setInfo(info) { recipeBasePrivate.set(this.derivedClass, RecipePrivatePropertyType.info, info); }

    setInstanceObj(instanceObj, isSingleton = true) {
        let key = isSingleton ? this.derivedClass : instanceObj;
        recipeBasePrivate.set(key, RecipePrivatePropertyType.ngInstance, instanceObj);
    }

    setRegistrationObj(registrationObj) { recipeBasePrivate.set(this.derivedClass, RecipePrivatePropertyType.ngRegistrationObj, registrationObj); }

    setRuntimeObject(runtimeObject) { recipeBasePrivate.set(this.derivedClass, RecipePrivatePropertyType.runtimeObject, runtimeObject);}
}

RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL = Symbol();
RecipeHelper.PROXY_FUNCTION_SYMBOL = Symbol();


const [recipeBasePrivate, ] = new ClassPrivate(RecipePrivatePropertyType);

class RecipeBase {
    static get ngRegistration() { return new RecipeHelper(null, this).getRegistrationObj(); }

    constructor(recipeType) {
        this[RECIPE_TYPE_SYMBOL] = recipeType;

        const derivedClass = this.constructor;
        if (recipeType !== RecipeType.Component && !Object
                .getOwnPropertySymbols(derivedClass)
                .find(s => s == RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL)) {

            throw new Error(`Illegal call to new ${derivedClass.name}(); only AngularJS can construct a recipe.`);
        }
    }

    // Given a property name within the injection array, replace it with another.
    static alias(propertyName, aliasName) {
        const derivedClass = this;
        let inject = derivedClass.$inject;

        if (!inject) throw new Error(`${derivedClass.name}.$inject missing. Did you forget @ngInject?`);
        if (typeof(propertyName) !== "string") throw new Error(`${derivedClass.name}.alias(): propertyName (string) required.`);
        if (typeof(aliasName) !== "string") throw new Error(`${derivedClass.name}.alias(): aliasName (string) required.`);

        if (!derivedClass.$alias) derivedClass.$alias = derivedClass.$inject.slice();
        let alias = derivedClass.$alias;

        for (let i = 0; i < inject.length; ++i) {
            if (inject[i] === propertyName) {
                alias[i] = aliasName;
                return alias;
            }
        }

        throw new Error(`${derivedClass.name}.alias(): Unable to find property "${propertyName}"`);
    }

    static inject(helper) { return helper.buildInjectionArray(); }

    // Add a namespace to one or more property names.
    static namespace(namespace, properties) {
        const derivedClass = this;

        if (typeof(namespace) !== "string") throw new Error(`${derivedClass.name}.namespace(): namespace (string) required.`);
        if (!(Array.isArray(properties) || typeof(properties) === "string"))
            throw new Error(`${derivedClass.name}.namespace(): properties (array or string) required.`);

        for (let propertyName of Array.isArray(properties) ? properties : [properties]) {
            RecipeBase.alias.call(derivedClass, propertyName, `${namespace}.${propertyName}`);
        }

        return derivedClass.$alias;
    }

    static register(helper, registerFn) {
        let inject = helper.buildInjectionArray();
        registerFn(inject);
        helper.setRegistrationObj(inject);
    }
}

export {
    RecipeBase,
    RecipeHelper,
    RecipeType
}