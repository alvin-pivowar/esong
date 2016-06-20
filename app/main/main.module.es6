// Copyright (c) Alvin Pivowar 2016

import ngRoute from "angular-route";
import modal from "angular-ui-bootstrap/src/modal";
import tabs from "angular-ui-bootstrap/src/tabs";

import LeftNavFeature from "../leftNav/leftNav.feature.es6";

class AppModule extends ngClass.Module {
    constructor() {
        super({
            name: "app",
            namespace: "main",
            dependencies: [ngRoute, modal, tabs, LeftNavFeature]
        });
    }
}

export default AppModule.register();