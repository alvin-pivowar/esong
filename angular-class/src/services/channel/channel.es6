// Copyright (c) Alvin Pivowar 2016

import Enum from "../../utility/enum.es6";
import {logger} from "./channelService.es6";
import StorageService from "../storage/storageService.es6";
import Usage from "../../utility/usage.es6";

import {getNameFromClient} from "./subscriber.es6";

const injector = angular.injector(["ng"]);
const $rootScope = injector.get("$rootScope");
const storageService = new StorageService();


const ChannelLifespan = new Enum({
    AppLifespan: 1,
    PublisherLifespan: 2
});


let subscriberList;
const channelInfo = new Map();
const channelKey = new WeakMap();

class Channel {
    get info() { return getFullInfo(this);  }

    constructor(_subscriberList, info) {
        subscriberList = _subscriberList;
        channelKey.set(this, info.key);

        if (!channelInfo.has(info.key)) {
            info.lifespan = info.lifespan || ChannelLifespan.AppLifespan;
            info.retainAllMessages = !!info.retainAllMessages;

            info.storageType = info.storageType || StorageService.defaultStorageType;
            info.storage = storageService.getStorage(info.storageType);

            info.currentMessageCount = 0;
            info.totalMessageCount = 0;

            channelInfo.set(info.key, info);
            setQueue(this, []);
        }
    }

    publish(...args) {
        let [publisher, messageData] = new Usage({
            $name: "publish",
            $format: "[publisher,] messageData",
            $out: ["publisher", "messageData"],
            1: "messageData",
            2: ["publisher", "messageData"],
            publisher: {
                rule: item => !!item,
                message: "publisher cannot be null."
            },
            messageData: {
                rule: item => !!item,
                message: "messageData cannot be null."
            }
        }).check(args);

        let publisherName = publisher ? getNameFromClient(publisher) : "anonymous";

        let message = messageData.$data ? messageData : { $data: messageData };
        const queue = getQueue(this);

        const info = getRawInfo(this);
        if (!info.retainAllMessages) {
            let [wasFound, index] = findMessageIndex(queue, message);
            if (wasFound) queue.splice(index, 1);
        }

        message.$id = ++this.info.totalMessageCount;
        queue.push(message);
        setQueue(this, queue);
        this.info.currentMessageCount = queue.length;

        logger.logInfo(`channel ${info.key} - publisher: ${publisherName}, message: ${JSON.stringify(message)}`);

        $rootScope.$applyAsync(() => { dispatch(this); });
    }

    subscribe(...args) {
        let [subscriber, callbackFn] = new Usage({
            $name: "subscribe",
            $format: "[subscriber,] callbackFn",
            $out: ["subscriber", "callbackFn"],
            1: "callbackFn",
            2: ["subscriber", "callbackFn"],
            subscriber: {
                rule: item => typeof(item) === "object" || typeof(item) === "function",
                message: "subscriber must be an object or constructor."
            },
            callbackFn: "function"
        }).check(args);

        const info = getRawInfo(this);
        if (subscriber) {
            subscriber = subscriberList.create(subscriber);
            let subscription = subscriber.addSubscription(info.key, callbackFn);

            $rootScope.$applyAsync(() => { dispatch(this, subscription, subscriber); });
        } else
            $rootScope.$applyAsync(() => {
                const queue = getQueue(this);
                let messages = [...queue.values()];

                if (messages.length > 0) {
                    callbackFn(messages, messages);

                    logger.logInfo(`channel ${info.key} - subscriber: anonymous, messages: ${messages.length}`);
                }
            });
    }
}


// Private helper functions for channel.

const dispatch = (channel, subscription, subscriber) => {
    const info = getRawInfo(channel);
    const queue = getQueue(channel);

    const processSubscription = (subscription, subscriber) => {
        let newMessages = queue.filter(message => message.$id > subscription.messageIndex);

        if (newMessages.length > 0) {
            let needsAllMessages = (subscription.callbackFn.length > 1);
            if (needsAllMessages)
                subscription.callbackFn(newMessages, [...queue.values()]);
            else
                subscription.callbackFn(newMessages);

            let subscriberName = subscriber ? getNameFromClient(subscriber) : "anonymous";
            logger.logInfo(`channel ${info.key} - subscriber: ${subscriberName}, messages: ${newMessages.length}`);
            subscription.messageIndex = info.totalMessageCount;
        }
    };

    if (subscription) {
        processSubscription(subscription, subscriber);
        return;
    }

    subscriberList.list().forEach(subscriber => {
        subscriber.subscriptions.forEach(subscription => { processSubscription(subscription, subscriber); });
    });

};

const findMessageIndex = (queue, message) => {
    let index = queue.findIndex(item => angular.equals(item, message));
    let wasFound = (index >= 0);
    return [wasFound, wasFound ? index : undefined];
};

const getFullInfo = channel => {
    const info = getRawInfo(channel);
    info.subscriptionCount = getSubscriptionCount(channel);
    return info;
};

const getRawInfo = channel => {
    const key = channelKey.get(channel);
    return channelInfo.get(key);
};

const getQueue = channel => {
    const info = getRawInfo(channel);
    const storage = info.storage;
    let value = storage.getItem(info.key);
    let needsSerialization = (info.storageType >= StorageService.StorageType.SessionStorage);
    return needsSerialization ? JSON.parse(value) : value;
};

const getSubscriptionCount = channel => {
    let count = 0;
    const info = getRawInfo(channel);

    subscriberList
        .list()
        .forEach(subscriber => {
            subscriber.subscriptions.forEach(subscription => {
                if (subscription.channelKey === info.key)
                    ++count;
            });
        });

    return count;
};

const setQueue = (channel, queue) => {
    const info = getRawInfo(channel);
    let needsSerialization = (info.storageType >= StorageService.StorageType.SessionStorage);
    let value = needsSerialization ? JSON.stringify(queue) : queue;
    const storage = info.storage;
    storage.setItem(info.key, value);
};


export {
    Channel,
    ChannelLifespan
};