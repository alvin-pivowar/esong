// Copyright (c) Alvin Pivowar 2016

import theApp from "./main.module.es6";

class RoutingConfig extends theApp.Config {
    /*@ngInject*/
    constructor($routeProvider, routingServiceProvider) {
        super();

        routingServiceProvider.routingInfo.forEach(item => {
            $routeProvider.when(item.route, { templateUrl: item.templateUrl });
        });

        $routeProvider.otherwise({ redirectTo: routingServiceProvider.routingInfo[0].route });
    }
}

RoutingConfig.register();
export default RoutingConfig;