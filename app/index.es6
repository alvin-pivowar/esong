// Copyright (c) Alvin Pivowar 2016

import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";

import "angular";
import "../angular-class"

import theApp from "./main/main.feature.es6";
angular.bootstrap(document.body, [theApp.name]);

export default theApp;