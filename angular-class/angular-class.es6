// Copyright (c) Alvin Pivowar 2016

import Module from "./src/module.es6";
import addInjectionToModel from "./src/model.es6";

(function(global) {
    global.ngClass = {
        Module: Module,
        addInjectionToModel: addInjectionToModel
    };
})(window);