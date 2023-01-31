const axios = require("axios");
const chalk = require("chalk");
import {
  TestRailOptions,
  TestRailResult,
  TestRunResult,
} from "./testrail.interface";
import moment = require("moment");

export class TestRail {
  private base: String;
  private runId: Number;
  private projectId: Number;
  private lastRunDate: string;
  private currentDate: string;

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  private getLastRun(): Promise<TestRunResult> {
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: `${this.base}/get_runs/${this.options.projectId}`,
        headers: {"Content-Type": "application/json"},
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
      }).then((response) => {
        resolve(response.data.runs[0]);
      });
    });
  }

  public isRunToday() {
    return this.getLastRun().then((lastRun) => {
      this.lastRunDate = moment.unix(lastRun.created_on).format("MM/DD/YYYY");
      // set current date with same format as this.lastRunDate
      this.currentDate = moment(new Date()).format("L");

      if (this.lastRunDate === this.currentDate) {
        console.log(
          `Test Run already created today. Posting results to Test Run ID: R${lastRun.id}`
        );
        return true;
      }
      return false;
    });
    // .catch(error => console.error(error));
  }

  public createRun(name: string, description: string) {
    // If the lastRunDate of the most current test run is equal to today's date, don't create a new test run.
    axios({
      method: "post",
      url: `${this.base}/add_run/${this.options.projectId}`,
      headers: {"Content-Type": "application/json"},
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({
        suite_id: this.options.suiteId,
        name,
        description,
        include_all: true,
      }),
    }).then((response) => {
      console.log("Creating Test Run... ---> Run id is:  ", response.data.id);
      this.runId = response.data.id;
    });
    // .catch(error => console.(error));
  }

  public publishResults(results: TestRailResult[]) {
    const publishToAPI = () => {
      axios({
        method: "post",
        url: `${this.base}/add_results_for_cases/${this.runId}`,
        headers: {"Content-Type": "application/json"},
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
        data: JSON.stringify({results}),
      })
        .then((response) => {
          console.log(
            "\n",
            chalk.magenta.underline.bold("(TestRail Reporter)")
          );
          console.log(
            "\n",
            ` - Results are published to ${chalk.magenta(
              `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
            )}`,
            "\n"
          );
        })
        .catch((error) => console.error(error));
    };

    if (!this.options.createTestRun) {
      this.runId = this.options.runId;
      publishToAPI();
    } else {
      this.getLastRun().then((lastRun) => {
        this.runId = lastRun.id;
        console.log(`Publishing results to latest run: ${this.runId}`);
        publishToAPI();
      });
    }
  }
}
