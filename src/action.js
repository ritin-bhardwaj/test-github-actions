const core = require('@actions/core');
const github = require("@actions/github");
const axios = require("axios");

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const IAP_TOKEN = core.getInput("IAP_TOKEN");
    console.log("IAP_TOKEN ", IAP_TOKEN);


     axios
       .post(
         `http://iap.prod.dsup.itential.io:3000/operations-manager/triggers/manual/` +
           "63a098884d843a38f80f100f" +
           "/run?token=" +
           "N2QxZDUyYTA0OTlhZDg2MThjMTFlNGMzZWJlZDM2MDE="
       )
       .then((res) => {
         console.log(res);
       })
       .catch((err) => console.log(err));
    
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