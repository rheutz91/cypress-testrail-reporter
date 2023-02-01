"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require("axios");
var chalk = require("chalk");
var moment = require("moment");
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.base = "https://" + options.domain + "/index.php?/api/v2";
        this.auth = {
            username: process.env["CYPRESS_TESTRAIL_REPORTER_USERNAME"] || options.username,
            password: process.env["CYPRESS_TESTRAIL_REPORTER_PASSWORD"] || options.password,
        };
    }
    TestRail.prototype.getLastRun = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            axios({
                method: "get",
                url: _this.base + "/get_runs/" + _this.options.projectId,
                headers: { "Content-Type": "application/json" },
                auth: _this.auth,
            }).then(function (response) {
                resolve(response.data.runs[0]);
            });
        });
    };
    TestRail.prototype.isRunToday = function () {
        var _this = this;
        return this.getLastRun().then(function (lastRun) {
            _this.lastRunDate = moment.unix(lastRun.created_on).format("MM/DD/YYYY");
            // set current date with same format as this.lastRunDate
            _this.currentDate = moment(new Date()).format("L");
            if (_this.lastRunDate === _this.currentDate) {
                console.log("Test Run already created today. Posting results to Test Run ID: R" + lastRun.id);
                return true;
            }
            return false;
        });
        // .catch(error => console.error(error));
    };
    TestRail.prototype.createRun = function (name, description) {
        var _this = this;
        // If the lastRunDate of the most current test run is equal to today's date, don't create a new test run.
        axios({
            method: "post",
            url: this.base + "/add_run/" + this.options.projectId,
            headers: { "Content-Type": "application/json" },
            auth: this.auth,
            data: JSON.stringify({
                suite_id: this.options.suiteId,
                name: name,
                description: description,
                include_all: true,
            }),
        }).then(function (response) {
            console.log("Creating Test Run... ---> Run id is:  ", response.data.id);
            _this.runId = response.data.id;
        });
        // .catch(error => console.(error));
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        var publishToAPI = function () {
            axios({
                method: "post",
                url: _this.base + "/add_results_for_cases/" + _this.runId,
                headers: { "Content-Type": "application/json" },
                auth: _this.auth,
                data: JSON.stringify({ results: results }),
            })
                .then(function (response) {
                console.log("\n", chalk.magenta.underline.bold("(TestRail Reporter)"));
                console.log("\n", " - Results are published to " + chalk.magenta("https://" + _this.options.domain + "/index.php?/runs/view/" + _this.runId), "\n");
            })
                .catch(function (error) { return console.error(error); });
        };
        if (!this.options.createTestRun) {
            this.runId = this.options.runId;
            publishToAPI();
        }
        else {
            this.getLastRun().then(function (lastRun) {
                _this.runId = lastRun.id;
                console.log("Publishing results to latest run: " + _this.runId);
                publishToAPI();
            });
        }
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map