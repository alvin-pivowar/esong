// Copyright (c) Alvin Pivowar 2016

import leftNav from "./leftNav.module.es6";

class LeftNavController extends leftNav.Controller {
    /*@ngInject*/
    constructor($location, $scope, routingService) {
        super();

        this.activeTabIndex = null;
    }

    init() {
        this.routingService.getRoutingInfo().then(response => {
            this.routing = response.data;
        });

        this.$scope.$watch(() => this.$location.path(), () => {
            for (let item of this.routing) {
                if (this.$location.path().indexOf(item.route) !== -1) {
                    this.activeTabIndex = item.ordinal;
                    break;
                }
            }
        });
    }

    onTabClick(item) {
        this.$location.path(item.route);
    }
}

LeftNavController.namespace("main", "routingService");


class LeftNavComponent extends leftNav.Component {
    /*@ngInject*/
    constructor() {
        super();

        this.bindings = {};
        this.controller = LeftNavController.inject();
        this.controllerAs = "vm";
        this.templateUrl = require("./leftNav.html");
    }
}


LeftNavComponent.register("leftNav");
export default LeftNavComponent;