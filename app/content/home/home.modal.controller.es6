// Copyright (c) Alvin Pivowar 2016

import theApp from "../../main/main.module.es6";

class HomeModalController extends theApp.Controller {
    /*@ngInject*/
    constructor($uibModalInstance, $window) {
        super();
    }

    buildEmailBody() {
        const today = new Date();

        let message = `
        Date: ${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}
        From: ${this.email}

        Dear Angular Al,

        ${this.comments.replace(/\r?\n|\r/g, " ")}

        ${this.firstName} ${this.lastName}`;

        return encodeURI(message);
    }

    cancel() { this.$uibModalInstance.dismiss("cancel"); }

    ok() { this.$uibModalInstance.close("ok"); }

    submit(isValid) {
        if (!isValid) return;

        this.$window.open(`mailto:alvin@ng-al.com?I%20Like%20It!&body=${this.buildEmailBody()}`, "_self");
        this.ok();
    }
}

export default HomeModalController;