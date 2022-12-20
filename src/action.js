const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const IAP_TOKEN = core.getInput("IAP_TOKEN");
    const IAP_INSTANCE = core.getInput("IAP_INSTANCE");
    const TIMEOUT = core.getInput("TIMEOUT");

    
    const jobStatus = (job_id) => {
         axios
           .get(
             `${IAP_INSTANCE}/workflow_engine/job/${job_id}/details?token=` +
               IAP_TOKEN
           )
           .then((res) => {
               console.log('Job Status: ',res.data.status);
               if (res.data.status === 'running')
                   setTimeout(() => { 
                       jobStatus(job_id);
                   }, TIMEOUT * 1000);
               else {
                   axios.get(
                     `${IAP_INSTANCE}/workflow_engine/job/${job_id}/output?token=` +
                       IAP_TOKEN
                   ).then((res) => {
                       console.log(res.data);
                   }).catch(err => {
                       console.log(err);
                   });
               }
           })
           .catch((err) => {
             console.log(err);
           });
    }

  axios
    .post(
      `${IAP_INSTANCE}/workflow_engine/startJobWithOptions/testGithub?token=` +
       IAP_TOKEN,
      { options: {} }
    )
    .then((res) => {
        console.log('Job id: ', res.data._id);
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