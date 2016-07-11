// Copyright (c) Alvin Pivowar 2016

import ChannelList from "./channelList.es6";
import {Logger, LogLevel} from "../../utility/logger.es6";
import {SubscriberList} from "./subscriber.es6";


const logger = new Logger();

class ChannelServiceMethods {
    get channels() {
        return this.channelList.list();
    }

    get logLevel() { return logger.logLevel; }
    set logLevel(logLevel) { logger.logLevel = logLevel; }

    get subscribers() {
        return this.subscriberList.list();
    }

    constructor(channelList, subscriberList) {
        this.channelList = channelList;
        this.subscriberList = subscriberList;
    }


    createChannel(info) {
        return this.channelList.create(info);
    }

    deleteChannel(key, forced = false) {
        return this.channelList.delete(key, forced);
    }

    getChannel(key) {
        return this.channelList.get(key);
    }


    findSubscribers(name) {
        return this.subscriberList.find(name);
    }

    getSubscriber(key) {
        return this.subscriberList.get(key);
    }

    registerSubscriber(key, name, description) {
        return this.subscriberList.create(key, name, description);
    }

    unregisterSubscriber(key) {
        return this.subscriberList.delete(key);
    }
}

class ChannelServiceChannelIndexing {
    constructor(channelList) {
        this.channelList = channelList;
    }

    get(target, property, receiver) {
        if (target[property]) return Reflect.get(target, property, receiver);

        return this.channelList.get(property) || this.channelList.create({ key: property });
    }
}


const subscriberList = new SubscriberList();
const channelList = new ChannelList(subscriberList);

const channelService = new Proxy(
    new ChannelServiceMethods(channelList, subscriberList),
    new ChannelServiceChannelIndexing(channelList)
);

channelService.LogLevel = LogLevel;


export {
    channelService,
    logger
};