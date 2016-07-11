// Copyright (c) Alvin Pivowar 2016

import Enum from "./enum.es6";

const injector = angular.injector(["ng"]);
const $log = injector.get("$log");

const LogLevel = new Enum({
    None: 0,
    Info: 1,
    Verbose: 2
});

class Logger {
    constructor(logLevel = LogLevel.None) {
        this.logLevel = logLevel;
    }

    logInfo(message) {
        if (this.logLevel.value >= LogLevel.Info.value)
            $log.info(message);
    }

    logVerbose(message) {
        if (this.logLevel.value >= LogLevel.Verbose.value)
            $log.debug(message);
    }
}


export {
    Logger,
    LogLevel
};