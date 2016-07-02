// Copyright (c) Alvin Pivowar 2016

import AngularCacheStorageStrategy from "./angularCacheStorageStrategy.es6"
import Enum from "../../utility/enum.es6";
import MemoryStorageStrategy from "./memoryStorageStrategy.es6";


const StorageType = new Enum({
    Memory: 1,
    AngularCache: 2,
    SessionStorage: 3,
    LocalStorage: 4
});

function determineDefaultStorageType() {
    const sessionStorage = window.sessionStorage;
    if (sessionStorage && typeof(sessionStorage.getItem) === "function")
        return StorageType.SessionStorage;

    return angular ? StorageType.AngularCache : StorageType.Memory;
}

class StorageService {
    get StorageType() { return StorageType; }

    constructor() {
        StorageService.defaultStorageType = determineDefaultStorageType();
    }

    getStorage(storageType = StorageService.defaultStorageType) {
        if (storageType == StorageType.LocalStorage) {
            const localStorage = window.localStorage;
            if (!localStorage || typeof(localStorage.getItem) !== "function")
                throw new Error("localStorage not available.");
        } else if (storageType > StorageService.defaultStorageType)
            throw new Error(`${storageType.key} not available.`);

        switch (storageType) {
            case StorageType.Memory:
                return new MemoryStorageStrategy();

            case StorageType.AngularCache:
                return new AngularCacheStorageStrategy();

            case StorageType.SessionStorage:
                return window.sessionStorage;

            case StorageType.LocalStorage:
                return window.localStorage;
        }
    }
}

export default StorageService;