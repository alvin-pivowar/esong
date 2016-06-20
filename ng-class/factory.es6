// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper} from "./utility/recipe.es6";

const Factory = module => {
    return class extends RecipeBase {
        static get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(null); }

        constructor(factoryFn) {
            super();

            if (this.isAngularCalling) {
                const derivedClass = this.constructor;
                if (typeof(factoryFn) !== "function")
                    throw new Error(`Factory ${derivedClass.name} missing required factoryFn.`);

                let helper = new RecipeHelper(module, derivedClass);
                helper.setInstanceObj(this);

                // Execute the factory function.
                // If the function returns a reference to the class itself, this is a run-time service that is to be new()ed
                // for each injection,
                let result = factoryFn();
                if (result == derivedClass)
                    derivedClass[RecipeHelper.CAN_CONSTRUCT_SYMBOL] = true;

                return result || this;
            }
        }

        get isAngularCalling() {
            const derivedClass = this.constructor;
            return !!Object.getOwnPropertySymbols(derivedClass).find(s => s == RecipeHelper.ANGULAR_CONSTRUCTION_SYMBOL);
        }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register(rawFactoryName) {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).factory(helper.buildRecipeName(rawFactoryName), inject);
            });
        }
    }
};

export default Factory;