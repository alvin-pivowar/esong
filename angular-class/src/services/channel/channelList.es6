// Copyright (c) Alvin Pivowar 2016

import {Channel, ChannelLifespan} from "./channel.es6";
import Schema from "../../utility/schema.es6";
import StorageService from "../storage/storageService.es6";


const channelSchema = new Schema({
    description: "string",
    key: "string",
    ownerKey: "object",
    lifespan: "object",
    retainAllMessages: "boolean",
    storageType: "object",

    $required: ["key"],
    $rules: [{
        propertyName: "lifespan",
        ruleFn: obj => (
            !obj.lifespan ||
            obj.lifespan === ChannelLifespan.AppLifespan ||
            obj.lifespan === ChannelLifespan.PublisherLifespan),
        message: "lifespan must be AppLifespan or PublisherLifespan."
    }, {
        propertyName: "storageType",
        ruleFn: obj => (
            !obj.storageType ||
            obj.storageType === StorageService.StorageType.Memory ||
            obj.storageType === StorageService.StorageType.AngularCache ||
            obj.storageType === StorageService.StorageType.SessionStorage ||
            obj.storageType === StorageService.StorageType.LocalStorage
        ),
        message: "storageType must be a valid StorageService.StorageType."
    }, {
        propertyName: "ownerKey",
        ruleFn: obj => !(obj.lifespan === ChannelLifespan.PublisherLifespan && !obj.ownerKey),
        message: "ownerKey is required for PublisherLifespan"
    }]
});


let channels;
let subscriberList;

class ChannelList {
    constructor(_subscriberList) {
        if (channels) throw new Error("ChannelList: channels already exist.");

        channels = [];
        subscriberList = _subscriberList;
    }

    create(info) {
        channelSchema.validate(info);
        if (channels.find(item => item.key === info.key))
            throw new Error(`There already exists a channel with the key: ${JSON.stringify(info.key)}`);

        let channel = new Channel(subscriberList, info);
        channels.push(channel);
        return channel;
    }

    delete(key, forced = false) {
        if (typeof(key) !== "string") throw new Error("ChannelList.delete(): key (string) is required.");

        let channel = channels.find(item => item.key === key);
        if (!channel)
            throw new Error(`Unable to find a channel with the key: ${JSON.stringify(key)}`);

        if (forced || channel.subscriptionCount === 0) {
            channels = channels.filter(item => item.key !== key);
            return true;
        }

        return false;
    }

    get(key) {
        if (typeof(key) !== "string") throw new Error("ChannelList.delete(): key (string) is required.");
        return channels.find(item => item.key === key);
    }

    list() {
        return channels.slice();
    }
}


export default ChannelList;