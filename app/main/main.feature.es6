// Copyright (c) Alvin Pivowar 2016

import "./main.less";

import theApp from "./main.module.es6";

import "./routing.config.es6";
import RoutingProvider from "./routing.provider.es6";
import HomeController from "../content/home/home.controller.es6";

theApp.provider(RoutingProvider.name, RoutingProvider.$inject);
theApp.controller(HomeController.name, HomeController.$inject);

export default theApp;
