// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper, RecipeType} from "./utility/recipe.es6";

const ConfigBlock = module => {
    return class extends RecipeBase {
        static get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(null); }

        constructor() {
            super(RecipeType.ConfigBlock);

            const derivedClass = this.constructor;
            new RecipeHelper(null, derivedClass).setInstanceObj(this);
        }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register() {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).config(inject);
            });
        }
    }
};

const RunBlock = module => {
    return class extends RecipeBase {
        static get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(null); }

        constructor() {
            super(RecipeType.RunBlock);

            const derivedClass = this.constructor;
            new RecipeHelper(null, derivedClass).setInstanceObj(this);
        }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register() {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).run(inject);
            });
        }
    }
};

export {
    ConfigBlock,
    RunBlock
}