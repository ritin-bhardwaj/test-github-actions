const core = require('@actions/core');
const github = require("@actions/github");
const axios = require("axios");

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const IAP_TOKEN = core.getInput("IAP_TOKEN");
    console.log("IAP_TOKEN ", IAP_TOKEN);

     axios.post(
       `http://localhost:3211/operations-manager/triggers/manual/` +
         "639a74eafeea2c0226e07b25" +
         "/run?token=" +
         IAP_TOKEN
     ).then(res => {
         console.log(res)
     }).catch(err =>
        console.log(err));
    
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context = {} } = github;
    const { pull_request } = context.payload;

    await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_request.number,
        body: 'Thankyopu for submitting a pull request! We will try to review this as soon as we can.'
    })
}

run();