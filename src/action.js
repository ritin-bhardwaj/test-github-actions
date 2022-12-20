const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const IAP_TOKEN = core.getInput("IAP_TOKEN");
    const iapInstance = "https://iap-selab-2021.1-prod.itential.io";
   
    console.log("IAP_TOKEN ", IAP_TOKEN);
    
    const jobStatus = (job_id) => {
         axios
           .get(
             `${iapInstance}/workflow_engine/job/${job_id}/details?token=` +
               IAP_TOKEN
           )
           .then((res) => {
               console.log(res.data.status);
               if (res.data.status === 'running')
                   setTimeout(() => { 
                       jobStatus(job_id);
                   },30*1000);
           })
           .catch((err) => {
             console.log(err);
           });
    }

  axios
    .post(
      `${iapInstance}/workflow_engine/startJobWithOptions/testGithub?token=` +
       IAP_TOKEN,
      { options: {} }
    )
    .then((res) => {
        console.log(res.data._id);
       jobStatus(res.data._id);
    })
    .catch((err) => console.log(err));

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
