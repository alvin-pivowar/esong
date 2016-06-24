// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper, RecipeType} from "./utility/recipe.es6";

const Component = module => {
    return class extends RecipeBase {
        constructor() {
            super(RecipeType.Component);
        }

        static inject() { throw new Error("Components can only be registered."); }

        static register(directiveName) {
            angular.module(module.name).component(directiveName, new this());
        }
    }
};

const Directive = module => {
    return class extends RecipeBase {
        constructor() {
            super(RecipeType.Directive);

            const derivedClass = this.constructor;
            new RecipeHelper(null, derivedClass).setInstanceObj(this, false);
        }

        get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(this); }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register(directiveName) {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).directive(directiveName, inject);
            });
        }
    }
};

export {
    Component,
    Directive
}