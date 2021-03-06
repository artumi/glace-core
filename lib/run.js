"use strict";
/**
 * Runs tests.
 *
 *  - executes `runner.js` file, which is entry point to load and execute
 *    files with tests
 *  - connects custom reporter to `mochajs`.
 *
 * @function
 * @name run
 * @arg {function} cb - Callback.
 */

var fs = require("fs");
var path = require("path");

var fse = require("fs-extra");
var Mocha = require("mocha");

var CONF = require("./config");
var hacking = require("./hacking");

var run = cb => {

    if (CONF.clearReport && fs.existsSync(CONF.reportsDir)) {
        fse.removeSync(CONF.reportsDir);
    };
    fse.mkdirsSync(CONF.reportsDir);

    if (CONF.uncaught !== "mocha") hacking.suppressMochaUncaught();

    var mocha = new Mocha({ grep: CONF.grep,
                            timeout: CONF.timeouts.chunk,
                            retries: CONF.chunkRetries,
                            reporter: path.resolve(__dirname, "reporter") });
    mocha.addFile(path.resolve(__dirname, "runner.js"));

    var _run = fin => {
        mocha.run(code => {
            var clampedCode = Math.min(code, 255);
            if (CONF.isRunPassed) clampedCode = 0;
            fin(clampedCode);
        });
    };
    if (cb) {
        _run(cb);
    } else {
        return new Promise(resolve => _run(resolve));
    };
};
module.exports = run;
