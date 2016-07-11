// Copyright (c) Alvin Pivowar 2016

import theApp from "../../main/main.module.es6";
import HomeModalController from "./home.modal.controller.es6";

ngClass.$channel.logLevel = ngClass.$channel.LogLevel.Verbose;

ngClass.$channel.createChannel({
    key: "test",
    retainAllMessages: true
});

ngClass.$channel["test"].publish("Hello, there!");

let subscriber = ngClass.$channel.registerSubscriber({}, "smedley");
subscriber.addSubscription("test", messages => { messages.forEach(message => console.log(message.$data)) });

ngClass.$channel["test"].publish({ $data: "another message" });

class HomeController extends theApp.Controller {
    /*@ngInject*/
    constructor($uibModal) {
        super();
    }

    openModal() {
        this.$uibModal.open({
            controller: HomeModalController.inject(),
            controllerAs: "vm",
            templateUrl: require("./home.modal.html")
        });
    }
}

HomeController.register("homeCtrl");
export default HomeController;