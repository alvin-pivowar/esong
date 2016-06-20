// Copyright (c) Alvin Pivowar 2016

import ClassPrivate from "./classPrivate.es6";
import Enum from "./enum.es6";
import {buildInjectionArray, buildRecipeName} from "./di.es6";


const RecipePrivatePropertyType = new Enum({
    info: 1,
    ngInstance: 2,
    ngRegistrationObj : 3,
    runtimeObject: 4
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
RecipeHelper.CAN_CONSTRUCT_SYMBOL = Symbol();
RecipeHelper.PROXY_FUNCTION_SYMBOL = Symbol();


const [recipeBasePrivate, ] = new ClassPrivate(RecipePrivatePropertyType);

class RecipeBase {
    static get ngRegistration() { return new RecipeHelper(null, this).getRegistrationObj(); }

    constructor() {
        const derivedClass = this.constructor;
        if (!Object
                .getOwnPropertySymbols(derivedClass)
                .find(s => ((s == RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL) || (s == RecipeHelper.CAN_CONSTRUCT_SYMBOL)))) {

            throw new Error(`Illegal call to new ${derivedClass.name}(); only AngularJS can construct a recipe.`);
        }
    }

    static inject(helper) { return helper.buildInjectionArray(); }

    static register(helper, registerFn) {
        let inject = helper.buildInjectionArray();
        registerFn(inject);
        helper.setRegistrationObj(inject);
    }
}

export {
    RecipeBase,
    RecipeHelper
}