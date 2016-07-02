// Copyright (c) Alvin Pivowar 2016


const storage = new Map();


class MemoryStorageStrategy {
    clear() {
        storage.clear();
    }

    getItem(key) {
        if (typeof(key) != "string") throw new Error("getItem: key (string) is required.");

        return storage.has(key) ? storage.get(key) : undefined;
    }

    removeItem(key) {
        if (typeof(key) != "string") throw new Error("getItem: key (string) is required.");

        if (storage.has(key))
            storage.delete(key);
    }

    setItem(key, value) {
        if (typeof(key) != "string") throw new Error("setItem: key (string) is required.");

        storage.set(key, value);
    }
}


export default MemoryStorageStrategy;