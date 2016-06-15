// Copyright (c) Alvin Pivowar 2016

import {buildInjectionArray} from "./utility/di.es6";

const RunBlock = module => {
    return class _run {
        constructor(recipeFn) {
            const derivedConstructor = this.constructor;
            if (derivedConstructor.name === "_run") throw new Error("Run class is abstract, use derivation.");

            angular.module(module.name).run(buildInjectionArray(module, derivedConstructor, recipeFn));
        }
    }
};

export default RunBlock;