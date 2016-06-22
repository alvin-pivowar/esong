// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper, RecipeType} from "./utility/recipe.es6";

const Factory = module => {
    return class extends RecipeBase {
        static get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(null); }

        constructor(factoryFn) {
            super(RecipeType.Factory);

            const derivedClass = this.constructor;
            if (typeof(factoryFn) !== "function")
                throw new Error(`Factory ${derivedClass.name} missing required factoryFn.`);

            let helper = new RecipeHelper(module, derivedClass);
            helper.setInstanceObj(this);

            let result = factoryFn();
            if (result == this) throw new Error("A factory function must return an object or a constructor.");
            if (result == derivedClass) throw new Error("A factory cannot return the constructor of the enclosing class.");

            return result;
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