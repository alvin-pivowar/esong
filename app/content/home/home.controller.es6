// Copyright (c) Alvin Pivowar 2016

import theApp from "../../main/main.module.es6";
import HomeModalController from "./home.modal.controller.es6";

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