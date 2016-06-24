// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper, RecipeType} from "./utility/recipe.es6";

const Controller = module => {
    return class extends RecipeBase {
        constructor() {
            super(RecipeType.Controller);

            const derivedClass = this.constructor;
            new RecipeHelper(null, derivedClass).setInstanceObj(this, false);
        }

        get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(this); }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register(rawConstructorName) {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).controller(helper.buildRecipeName(rawConstructorName), inject);
            });
        }
    }
};

export default Controller;