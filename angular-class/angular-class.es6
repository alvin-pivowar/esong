// Copyright (c) Alvin Pivowar 2016

import {channelService} from "./src/services/channel/channelService.es6";
import StorageService from "./src/services/storage/storageService.es6";

import Module from "./src/module.es6";

import addInjectionToModel from "./src/model.es6";


(function(global) {
    global.ngClass = {
        $channel: channelService,
        $storage: new StorageService(),

        Module: Module,

        addInjectionToModel: addInjectionToModel
    };
})(window);