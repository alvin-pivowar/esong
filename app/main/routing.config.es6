// Copyright (c) Alvin Pivowar 2016

import theApp from "./main.module.es6";

class RoutingConfig extends theApp.Config {
    /*@ngInject*/
    constructor($routeProvider, routingServiceProvider) {
        super(λ => {
            routingServiceProvider.routingInfo.forEach(item => {
                $routeProvider.when(item.route, { templateUrl: item.templateUrl });
            });

            $routeProvider.otherwise({ redirectTo: routingServiceProvider.routingInfo[0].route });
        });
    }
}

const routingConfig = new RoutingConfig();
export default routingConfig;