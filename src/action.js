const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const IAP_TOKEN = core.getInput("IAP_TOKEN");
  const IAP_INSTANCE = core.getInput("IAP_INSTANCE");
  const API_ENDPOINT = core.getInput("API_ENDPOINT");
  const API_ENDPOINT_BODY = core.getInput("API_ENDPOINT_BODY");
  const TIMEOUT = core.getInput("TIMEOUT");
  const NO_OF_ATTEMPTS = core.getInput("NO_OF_INPUTS");
  const JOB_STATUS = core.getInput("JOB_STATUS");
  let count = 0;

  //check the status of the job and return the output
  const jobStatus = (job_id) => {
    axios
      .get(
        `${IAP_INSTANCE}/operations-manager/jobs/${job_id}?token=` + IAP_TOKEN
      )
      .then((res) => {
        console.log("Job Status: ", res.data.data.status);
        if (res.data.data.status === "running" && count < NO_OF_ATTEMPTS) {
          setTimeout(() => {
            count += 1;
            jobStatus(job_id);
          }, TIMEOUT * 1000);
        } else if (res.data.data.status === "complete") {
          core.setOutput("results", res.data.data.variables);
          console.log("Job Output: ", res.data.data.variables);
        } else if (res.data.data.status === "canceled") {
          core.setFailed("Job Canceled");
        } else if (res.data.data.status === "error") {
          core.setFailed(res.data.data.error);
        } else {
          core.setFailed("Job Timeout");
        }
      })
      .catch((err) => {
        core.setFailed(err.response.data);
      });
  };

  //start the job on GitHub event
  const startJob = () => {
    axios
      .post(
        `${IAP_INSTANCE}/operations-manager/triggers/endpoint/${API_ENDPOINT}?token=` +
          IAP_TOKEN,
        JSON.parse(API_ENDPOINT_BODY)
      )
      .then((res) => {
        if (JOB_STATUS === "true") jobStatus(res.data.data._id);
      })
      .catch((err) => {
        core.setFailed(err.response.data);
      });
  };
  startJob();

  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request.number,
    body: "Thankyou for submitting a pull request! We will try to review this as soon as we can. ",
  });
}

run();
