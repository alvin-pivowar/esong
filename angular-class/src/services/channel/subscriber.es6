// Copyright (c) Alvin Pivowar 2016

import ClassPrivate from "../../utility/classPrivate.es6";
import Enum from "../../utility/enum.es6";
import Usage from "../../utility/usage.es6";

import {logger} from "./channelService.es6";


class Subscription {
    constructor(channelKey, name, callbackFn, notificationFn) {
        this.channelKey = channelKey;
        this.name = name;
        this.callbackFn = callbackFn;
        this.notificationFn = notificationFn;

        this.messageIndex = 0;
    }
}


const [subscriberPrivate, subscriberPropertyEnum] = new ClassPrivate(new Enum({
    Description: 1,
    Key: 2,
    Name: 3,
}));

class Subscriber {
    get description() { return subscriberPrivate.get(this, subscriberPropertyEnum.Description); }
    get key() { return subscriberPrivate.get(this, subscriberPropertyEnum.Key); }
    get name() { return subscriberPrivate.get(this, subscriberPropertyEnum.Name); }
    get totalMessagesReceived() { return getTotalMessagesReceived(this); }


    constructor(key, name, description) {
        subscriberPrivate.set(this, subscriberPropertyEnum.Key, key);
        subscriberPrivate.set(this, subscriberPropertyEnum.Name, name);
        subscriberPrivate.set(this, subscriberPropertyEnum.Description, description);

        this.subscriptions = [];
    }

    // addSubscription(channelKey [,name] ,callbackFn [,notificationFn])
    addSubscription(...args) {
        let params = args;
        let index = 0;

        let channelKey = params.length > index ? params[index++] : undefined;
        let name = (params.length > index && typeof(params[index]) === "string") ? params[index++] : undefined;
        let callbackFn = params.length > index ? params[index++] : undefined;
        let notificationFn = params.length > index ? params[index] : undefined;

        if (typeof(channelKey) !== "string") throw new Error("Subscriber.addSubscription(): channelKey (string) is required.");
        if (name && typeof(name) !== "string") throw new Error("Subscriber.addSubscription(): name must be a string.")
        if (typeof(callbackFn) !== "function") throw new Error("Subscriber.addSubscription(): callbackFn (function) is required.");
        if (notificationFn && typeof(notificationFn) !== "function") throw new Error("Subscriber.addSubscription(): notificationFn must be a function.")

        let subscription = new Subscription(channelKey, name, callbackFn, notificationFn);
        this.subscriptions.push(subscription);

        let subscriberName = this.name || getNameFromClient(this.key);
        logger.logVerbose(`channel ${channelKey} - subscription added by {key: ${this.key.toString()}, name: ${subscriberName}}`);

        return subscription;
    }

    deleteSubscription(channelKeyOrName) {
        if (typeof(channelKeyOrName) !== "string")
            throw new Error("Subscriber.deleteSubscription(): channelKeyOrName (string) is required.");

        let matches = this.subscriptions.filter(item => (item.channelKey === channelKeyOrName || item.name === channelKeyOrName));
        if (matches.length === 0)
            throw new Error(`Subscriber.deleteSubscription(): "${channelKeyOrName}" did not match any subscriptions.`);
        if (matches.length > 1)
            throw new Error(`Subscriber.deleteSubscription(): "${channelKeyOrName}" matched multiple subscriptions, use name.`);

        this.subscriptions = this.subscriptions.filter(item => (item.channelKey !== channelKeyOrName && item.name !== channelKeyOrName));

        let subscriberName = this.name || getNameFromClient(this.key);
        logger.logVerbose(`channel ${channelKeyOrName} - subscription deleted by {key: ${this.key.toString()}, name: ${subscriberName}}`);
    }

    getSubscription(channelKeyOrName) {
        if (typeof(channelKeyOrName) !== "string")
            throw new Error("Subscriber.getSubscription(): channelKeyOrName (string) is required.");

        let matches = this.subscriptions.filter(item => (item.channelKey === channelKeyOrName || item.name === channelKeyOrName));
        if (matches.length === 0)
            throw new Error(`Subscriber.getSubscription(): "${channelKeyOrName}" did not match any subscriptions.`);
        if (matches.length > 1)
            throw new Error(`Subscriber.getSubscription(): "${channelKeyOrName}" matched multiple subscriptions, use name.`);

        return matches[0];
    }
}


const getTotalMessagesReceived = subscriber =>
    subscriber.subscriptions
        .map(subscription => subscription.messageIndex)
        .reduce((prev, curr) => prev + curr, 0);



let subscriberSet;
let subscriberMap;

class SubscriberList {
    constructor() {
        if (subscriberSet) throw new Error("SubscriberList: subscribers already exist.");

        subscriberSet = new Set();
        subscriberMap = new WeakMap();
    }

    // create(subscriber [,name] [,description])
    create(...args) {
        let [subscriber, name, description] = new Usage({
            $name: "registerSubscriber",
            $format: "subscriber [,name] [,description]",
            $out: ["subscriber", "name", "description"],
            1: "subscriber",
            2: ["subscriber", "description"],
            3: ["subscriber", "name", "description"],
            subscriber: {
                rule: item => !!item,
                message: "subscriber is required."
            },
            name: {
                rule: item => !item || typeof(item) === "string",
                message: "name not a string."
            },
            description: {
                rule: item => !item || typeof(item) === "string",
                message: "description not a string."
            }
        }).check(args);

        const key = subscriber;
        if (subscriberMap.has(key))
            throw new Error(`SubscriberList.create(): There is already a subscriber with the key ${JSON.stringify(key)}`);

        if (!name)
            name = getNameFromClient(key);

        this.sync();

        subscriber = new Subscriber(key, name, description);
        subscriberSet.add(key);
        subscriberMap.set(key, subscriber);

        logger.logVerbose(`channel - subscriber added: {key: ${key.toString()}, name: ${name}}`);

        return subscriber;
    }

    delete(key) {
        if (!key) throw new Error("SubscribeList.create(): key is required.");

        this.sync();

        if (!subscriberMap.has(key)) return false;

        subscriberSet.remove(key);
        subscriberMap.remove(key);

        logger.logVerbose(`channel - subscriber deleted: {key: ${key.toString()}, name: ${getNameFromClient(key)}}`);

        return true;
    }

    find(name) {
        if (typeof(name) !== "string") throw new Error("SubscriberList.find(): name (string) is required.");

        this.sync();

        return [...subscriberSet.keys()]
            .map(key => subscriberMap.get(key))
            .filter(subscriber => subscriber.name === name);
    }

    get(key) {
        if (!key) throw new Error("SubscribeList.create(): key is required.");

        this.sync();
        return subscriberMap.has(key) ? subscriberMap.get(key) : undefined;
    }

    list() {
        this.sync();

        return [...subscriberSet.keys()].map(key => subscriberMap.get(key));
    }

    sync() {
        for (let key of subscriberSet.keys()) {
            if (!subscriberMap.has(key))
                subscriberSet.remove(key);
        }
    }
}


const getNameFromClient = obj => {
    if (!obj) throw new Error("channel client cannot be null.")

    if (obj.name) return obj.name;
    if (obj.constructor && obj.constructor.name && obj.constructor.name !== "Object") return obj.constructor.name;

    const prototype = Object.getPrototypeOf(obj);
    if (prototype && prototype.constructor && prototype.constructor.name && prototype.constructor.name !== "Object")
        return prototype.constructor.name;

    throw new Error(`Unable to determine name from ${JSON.stringify(obj)}`);
};


export {
    Subscriber,
    SubscriberList,
    Subscription,
    getNameFromClient
};