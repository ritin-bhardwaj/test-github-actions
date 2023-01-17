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
  const PREV_JOB_OUTPUT = core.getInput("PREV_JOB_OUTPUT");
  let count = 0;
  console.log("Previous Job Output", typeof (PREV_JOB_OUTPUT), PREV_JOB_OUTPUT)
  console.log(API_ENDPOINT_BODY)
 try {
   //check the status of the job and return the output
   const jobStatus211 = (job_id) => {
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
             jobStatus211(job_id);
           }, TIMEOUT * 1000);
         } else if (res.data.status === "complete") {
           axios
             .get(
               `${IAP_INSTANCE}/workflow_engine/job/${job_id}/output?token=` +
                 IAP_TOKEN
             )
             .then((res) => {
               core.setOutput("results",res.data.variables);
             })
             .catch((err) => {
               core.setFailed(err.response.data);
             });
         } else if (res.data.status === "canceled") {
           core.setFailed("Job Canceled");
         } else if (res.data.status === "error") {
           core.setFailed(res.data.error);
         } else {
           core.setFailed("Job Timeout");
         }
       })
       .catch((err) => {
         core.setFailed(err.response.data);
       });
   };

   const jobStatus221 = (job_id) => {
     axios
       .get(
         `${IAP_INSTANCE}/operations-manager/jobs/${job_id}?token=` + IAP_TOKEN
       )
       .then((res) => {
         console.log("Job Status: ", res.data.data.status);
         if (res.data.data.status === "running" && count < NO_OF_ATTEMPTS) {
           setTimeout(() => {
             count += 1;
             jobStatus221(job_id);
           }, TIMEOUT * 1000);
         } else if (res.data.data.status === "complete") {
           core.setOutput("results", res.data.data.variables);
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
      .get(`${IAP_INSTANCE}/health/server?token=` + IAP_TOKEN)
      .then((res) => {
        const release = res.data.release.substring(
          0,
          res.data.release.lastIndexOf(".")
        );

        axios
          .post(
            `${IAP_INSTANCE}/operations-manager/triggers/endpoint/${API_ENDPOINT}?token=` +
              IAP_TOKEN,
            JSON.parse(API_ENDPOINT_BODY)
          )
          .then((res) => {
            if (JOB_STATUS === "true") {
              if (release === "2021.1") jobStatus211(res.data._id);
              else if (release === "2021.2" || release === "2022.1")
                jobStatus221(res.data.data._id);
              else
                core.setFailed(
                  `This Github Action doesn't support IAP release ${release}`
                );
            }
          })
          .catch((err) => {
            core.setFailed(err.response.data);
          });
      })
      .catch((err) => {
        core.setFailed(err);
      });
   };

   startJob();
 } catch (e) {
   core.setFailed(e);
 }
}



run();


 
