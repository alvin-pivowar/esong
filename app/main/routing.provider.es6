// Copyright (c) Alvin Pivowar 2016

import RoutingItem from "./routingItem.model.es6";
import theApp from "./main.module.es6";

let index = 0;
const routingInfo = [
    new RoutingItem(index++, "Home", "/home", require("../content/home/home.html")),
    new RoutingItem(index++, "Start Up", "/startup", require("../content/startupTopic.html")),
    new RoutingItem(index++, "Main", "/main", require("../content/mainTopic.html")),
    new RoutingItem(index++, "Left Nav", "/leftNav", require("../content/leftNavTopic.html")),
    new RoutingItem(index++, "Models", "/models", require("../content/modelsTopic.html")),
    new RoutingItem(index++, "Recipes", "/recipes", require("../content/recipesTopic.html"))
];

class RoutingService extends theApp.Service {
    /*@ngInject*/
    constructor($q) {
        super();
    }

    getRoutingInfo() {
        return this.$q((accept, reject) => {
            accept({data: this.routingInfo});
        });
    }
}

class RoutingProvider extends theApp.Provider {
    /*@ngInject*/
    constructor() {
        super({
            runtimeService: RoutingService,
            sharedData: routingInfo,
            sharedDataAs: "routingInfo"
        });
    }
}

RoutingProvider.register("routingService");
export default RoutingProvider;