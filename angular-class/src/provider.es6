// Copyright (c) Alvin Pivowar 2016

import {RecipeBase, RecipeHelper, RecipeType} from "./utility/recipe.es6";
import Schema from "./utility/schema.es6";


const providerInfoSchema = new Schema({
    factoryFn: "function",
    runtimeService: "array or function",
    sharedData: "object",
    sharedDataAs: "string",

    $required: ["runtimeService"],
    $rule: {
        propertyName: "sharedData",
        ruleFn: (obj) => !(obj.sharedDataAs && !obj.sharedData),
        message: "sharedDataAs requires sharedData."
    }
});


const Provider = module => {
    return class extends RecipeBase {
        static get ngInstance() { return new RecipeHelper(null, this).getInstanceObj(null); }

        constructor(info) {
            providerInfoSchema.validate(info);
            super(RecipeType.Provider);

            const derivedClass = this.constructor;
            const helper = new RecipeHelper(module, derivedClass);
            helper.setInfo(info);
            helper.setInstanceObj(this);
            helper.setRuntimeObject(Array.isArray(info.runtimeService) ? info.runtimeService : info.runtimeService.inject());

            if (info.sharedData) {
                let propertyName = info.sharedDataAs || "$shared";
                this[propertyName] = info.sharedData;
            }
        }

        get $get() {
            const derivedClass = this.constructor;
            const helper = new RecipeHelper(module, derivedClass);
            const info = helper.getInfo();

            let inject = helper.getRuntimeObject();

            // If we are sharing a data object between the config and run-time parts,
            // create a "wrapper" proxy to add the shared data property to the service.
            if (info.sharedData) {
                let oldProxy = inject[inject.length - 1];
                let newProxy = (...args) => {
                    let instance = new oldProxy(...args);
                    let propertyName = info.sharedDataAs || "$shared";
                    instance[propertyName] = info.sharedData;
                    return instance;
                };

                inject[inject.length - 1] = newProxy;
            }

            return inject;
        }

        static inject() { return RecipeBase.inject(new RecipeHelper(module, this)); }

        static register(rawProviderName) {
            const helper = new RecipeHelper(module, this);

            RecipeBase.register(helper, inject => {
                angular.module(module.name).provider(helper.buildRecipeName(rawProviderName), inject);
            });
        }
    }
};

export default Provider;