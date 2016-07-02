// Copyright (c) Alvin Pivowar 2016

let ngClassCache = null;

class AngularCacheStorageStrategy {
    constructor() {
        const injector = angular.injector(["ng"]);
        const $cacheFactory = injector.get("$cacheFactory");
        ngClassCache = $cacheFactory("ngClass");
    }

    clear() {
        ngClassCache.removeAll();
    }

    getItem(key) {
        if (typeof(key) != "string") throw new Error("getItem: key (string) is required.");

        return ngClassCache.get(key);
    }

    removeItem(key) {
        if (typeof(key) != "string") throw new Error("getItem: key (string) is required.");

        ngClassCache.remove(key);
    }

    setItem(key, value) {
        if (typeof(key) != "string") throw new Error("setItem: key (string) is required.");

        ngClassCache.put(key, value);
    }
}


export default AngularCacheStorageStrategy;