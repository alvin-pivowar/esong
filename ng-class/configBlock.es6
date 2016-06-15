// Copyright (c) Alvin Pivowar 2016

import {buildInjectionArray} from "./utility/di.es6";

const ConfigBlock = module => {
    return class _config {
        constructor(recipeFn) {
            const derivedConstructor = this.constructor;
            if (derivedConstructor.name === "_config") throw new Error("Config class is abstract, use derivation.");

            angular.module(module.name).config(buildInjectionArray(module, derivedConstructor, recipeFn));
        }
    }
};

export default ConfigBlock;