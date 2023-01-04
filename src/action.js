const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const IAP_TOKEN = core.getInput("IAP_TOKEN");
  const IAP_INSTANCE = core.getInput("IAP_INSTANCE");
  const WORKFLOW = core.getInput("WORKFLOW");
  const TIMEOUT = core.getInput("TIMEOUT");
  const NO_OF_ATTEMPTS = core.getInput("NO_OF_INPUTS");
  const JOB_STATUS = core.getInput("JOB_STATUS");
  let count = 0;
  console.log(JOB_STATUS);
  //check the status of the job and return the output
  const jobStatus = (job_id) => {
    axios
      .get(
        `${IAP_INSTANCE}/workflow_engine/job/${job_id}/details?token=` +
          IAP_TOKEN
      )
      .then((res) => {
        console.log("Job Status: ", res.data.status);
          if (res.data.status === "running" && count < NO_OF_ATTEMPTS) {
              setTimeout(() => {
                  count += 1;
              jobStatus(job_id);
            }, TIMEOUT * 1000);
        }
          
        else if (res.data.status === "complete") {
          axios
            .get(
              `${IAP_INSTANCE}/workflow_engine/job/${job_id}/output?token=` +
                IAP_TOKEN
            )
            .then((res) => {
              console.log('Job Output: ',res.data);
            })
            .catch((err) => {
              console.log(err);
            });
        } else if (res.data.status === "canceled") {
          console.log("Job Canceled");
        } else if (res.data.status === "error") {
          console.log(res.data);
        } else {
          console.log("Workflow Timeout");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

//start the job on GitHub event
  const startJob = () => {
    axios
      .post(
        `${IAP_INSTANCE}/workflow_engine/startJobWithOptions/${WORKFLOW}?token=` +
          IAP_TOKEN,
        { options: {} }
      )
      .then((res) => {
        console.log("Job id: ", res.data._id);
        if(JOB_STATUS)
          jobStatus(res.data._id);
      })
      .catch((err) => console.log(err));
  }
  
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
