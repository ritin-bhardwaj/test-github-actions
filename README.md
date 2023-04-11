# Github action to run IAP Automation

## Usage

_See [action.yml](action.yml) for [metadata](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions) that defines the inputs, outputs, and runs configuration for this action._

_For more information about workflows, see [Using workflows](https://docs.github.com/en/actions/using-workflows)._

Create a workflow that runs when Issues or Pull Requests are opened or labeled in your repository; Optionally configure any filters you may want to add, such as only trigger workflow with certain branch.

Once you've configured your workflow, save it as a `.yml` file in your target Repository's `.github/workflows` directory.

### Examples

#### Example Usage:Trigger Automation

```yaml
# This is a basic workflow to help you get started with Actions
name: Trigger automation on pull request
# Controls when the workflow will run
on:
  pull_request:
    types: [opened]

jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      output1: ${{ steps.step1.outputs.results }}
    name: API Endpoint Trigger
    steps:
      # To use this repository's private action,
      # you must check out the repository
      - name: Checkout
        uses: actions/checkout@v3
      - name: Hello world action step
        id: step1
        uses: itential/test-action@version
        env:
          IAP_TOKEN: ${{secrets.IAP_TOKEN}}
          IAP_INSTANCE: ${{secrets.IAP_INSTANCE}}
          API_ENDPOINT: ${{secrets.API_ENDPOINT}}
          API_ENDPOINT_BODY: ${{secrets.API_ENDPOINT_BODY}}
          NO_OF_ATTEMPTS: 10
          TIME_INTERVAL: 15
      - name: Get output
        run: echo "${{steps.step1.outputs.results}}"
```

## Input Parameters Required
| Parameter | Description |
| --------- | ----------- |
| IAP_INSTANCE | URL to the IAP Instance |
| IAP_TOKEN | To authenticate api requests to the instance |
| API_ENDPOINT | API endpoint name to trigger an automation |
| API_ENDPOINT_BODY | The POST body used to create the workflow input |

## Other Input Parameters (Optional)
| Parameter | Description | Default |
| --------- | ----------- | ------- |
| JOB_STATUS | If user want to check the status of the job. (0/1) | 1 |
| TIME_INTERVAL | Time interval to check job status (in sec) | 15 sec |
| NO_OF_ATTEMPTS | No of attempts to check job status | 10 |

## Output
| Parameter | Description |
| --------- | ----------- |
| results | API Trigger output variables |
## API
GET /health/server

POST /operations-manager/triggers/endpoint/:routeName

- ### IAP Release <= 2021.1
        GET /workflow_engine/job/:job_id/details

        GET /workflow_engine/job/:job_id/output

- ### IAP Release > 2021.1
        GET /operations-manager/jobs/:id
