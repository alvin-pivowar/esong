// Copyright (c) Alvin Pivowar 2016

import ClassPrivate from "./../ng-class/utility/classPrivate.es6";
import Enum from "./../ng-class/utility/enum.es6";
import Schema from "./schema.es6";

import {buildInjectionArray, XXX} from "./../ng-class/utility/di.es6";


const RecipePrivatePropertyType = new Enum({
    ngRecipeInstance : 1,
    ProviderRunTimeObject: 2,
    RecipeState: 3
});

const RecipeState = new Enum({
    ConfigTime: 1,
    Injected: 2,
    RunTime: 3
});


const recipeBaseInfoSchema = new Schema({
    isSingleton: "boolean",
    module: "object",
    ngRecipeName: "string",
    rawRegisterName: "string",
    recipeClassName: "string",
    recipeFactoryFn: "function",
    recipeStatePostInjection: "object",

    $required: ["isSingleton", "module", "ngRecipeName", "recipeClassName", "recipeStatePostInjection"]
});


const [recipeBasePrivate, ] = new ClassPrivate(RecipePrivatePropertyType);

class RecipeBase {
    constructor(info) {
        recipeBaseInfoSchema.validate(info);

        const derivedClass = this.constructor;
        const state = recipeBasePrivate.get(derivedClass, RecipePrivatePropertyType.RecipeState);

        // If this is post-injection, there is nothing else to do.
        if (state === info.recipeStatePostInjection)
            return this;

        // If the state is injected, then Angular is creating the object.
        if (state === RecipeState.Injected) {
            recipeBasePrivate.set(derivedClass, RecipePrivatePropertyType.RecipeState, info.recipeStatePostInjection);
            if (info.isSingleton)
                recipeBasePrivate.set(derivedClass, RecipePrivatePropertyType.ngRecipeInstance, this);
            else
                recipeBasePrivate.set(this, RecipePrivatePropertyType.ngRecipeInstance, this);

            return info.recipeFactoryFn
                ? (info.recipeFactoryFn() || this)
                : this;
        }

        // First-time call to constructor.
        if (derivedClass.name === "RecipeBase" || derivedClass.name === info.recipeClassName)
            throw new Error(`${info.recipeClassName} is abstract, use derivation.`);

        let injectionArray = buildInjectionArray(module, derivedClass);

        switch (info.ngRecipeName) {
            case "config":
            case "run":
                angular.module(info.module.name)[info.ngRecipeName](injectionArray);
                break;

            default:
                if (info.rawRegisterName) {
                    angular
                        .module(info.module.name)
                        [info.ngRecipeName](XXX(module, info.rawRegisterName), injectionArray);
                }
        }



        if (info.ngRecipeName)

        recipeBasePrivate.set(derivedClass, RecipePrivatePropertyType.RecipeState, RecipeState.Injected);

        // If called without a name to register, return the injection array.
        return info.rawRegisterName ? this : injectionArray;
    }
}


const Factory = module => {
    return class Factory extends RecipeBase {
        get ngFactory() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.ngRecipeInstance); }
        get runTime() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.RecipeState) === RecipeState.RunTime; }

        constructor(arg1, arg2) {
            const isAnonymous = (typeof(arg1) !== "string");
            const factoryName = isAnonymous ? undefined : arg1;
            const factoryFn = isAnonymous ? arg1 : arg2;
            if (typeof(factoryFn) !== "function") throw new Error("Factory: factoryFn missing.");

            super({
                isSingleton: true,
                module: module,
                ngRecipeName: "factory",
                rawRegisterName: factoryName,
                recipeClassName: "Factory",
                recipeFactoryFn: factoryFn,
                recipeStatePostInjection: RecipeState.RunTime
            });
        }
    }
};


const providerInfoSchema = new Schema({
    factoryFn: "function",
    name: "string",
    runtimeClass: "function",
    runtimeInjectionArray: "array",

    $required: ["name"],
    $one: [["runtimeClass", "runtimeInjectionArray"]]
});

const Provider = module => {
    return class Provider extends RecipeBase {
        get ngProvider() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.ngRecipeInstance); }
        get configTime() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.RecipeState) === RecipeState.ConfigTime; }

        constructor(info) {
            providerInfoSchema.validate(info);

            super({
                isSingleton: true,
                module: module,
                ngRecipeName: "provider",
                rawRegisterName: info.name,
                recipeClassName: "Provider",
                recipeFactoryFn: info.factoryFn,
                recipeStatePostInjection: RecipeState.ConfigTime
            });

            const derivedClass = this.constructor;
            const state = recipeBasePrivate.get(derivedClass, RecipePrivatePropertyType.RecipeState);

            if (state === RecipeState.Injected) {
                let runtimeObj = info.runtimeClass ? new info.runtimeClass() : info.runtimeInjectionArray;
                recipeBasePrivate.set(derivedClass, RecipePrivatePropertyType.ProviderRunTimeObject, runtimeObj);
            }
        }

        get $get() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.ProviderRunTimeObject); }
    }
};


const Service = module => {
    return class Service extends RecipeBase {
        get ngService() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.ngRecipeInstance); }
        get runTime() { return recipeBasePrivate.get(this.constructor, RecipePrivatePropertyType.RecipeState) === RecipeState.RunTime; }

        constructor(rawServiceName) {
            super({
                isSingleton: true,
                module: module,
                ngRecipeName: "service",
                rawRegisterName: rawServiceName,
                recipeClassName: "Service",
                recipeStatePostInjection: RecipeState.RunTime
            });
        }
    }
};


export {
    Factory,
    Provider,
    RecipeBase,
    RecipePrivatePropertyType,
    RecipeState,
    Service,

    recipeBasePrivate
}