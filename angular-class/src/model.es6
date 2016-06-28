// Copyright (c) Alvin Pivowar 2016

const injectionHandler = {
    get: function(target, property, receiver) {
        if (target[property]) return Reflect.get(target, property, receiver);

        const $injector = angular.injector(["ng"]);
        if ($injector.has(property)) {
            target[property] = $injector.get(property);
            return Reflect.get(target, property, receiver);
        }

        const prototype = Object.getPrototypeOf(target);
        const constructor = prototype.constructor;
        throw new Error(`Unable to inject "${property}" into ${constructor.name}.`);
    }
};

function addInjectionToModel(model) {
    return buildConstructorProxy(model);
}

function buildConstructorProxy(model) {
    return (...args) => {
        let instance = new model(...args);
        return new Proxy(instance, injectionHandler);
    }
}

export default addInjectionToModel;