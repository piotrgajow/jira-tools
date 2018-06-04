# jira-tools
Set of tools for extracting data from Jira issues

## Setup

- Run `npm install`
- Generate authentication token
  - Create API token on this [webpage](https://id.atlassian.com/manage/api-tokens) (Create API token > Enter label > Create > Copy to clipboard)
  - Prepare authentication data from your Jira account email address and the API token - `email:token`
  - Encode the authentication data using Base64 e.g. `npm start -- encode test@example.com:AbCdEfG12`
  - Last printed line is the authentication token
- Copy `config.template.json` to `config.json`
- Fill `config.json` values
  - `baseUrl`: Jira domain e.g. `jira.atlassian.com`
  - `projectKey`: Jira project key (first part of issue key) e.g. `TEST`
  - `authToken`: Your Jira authentication token generated in the first step.

## Usage

### `issue-stats [ids...]`

- [ids...] - list of jira ids

For each id, corresponding issue will be loaded from Jira and analyzed:
- for sub-tasks - print statistics
- for uset stories - print statistics of all its subtasks

Statistics include:
- issue key
- story points
- start of development date
- days in status "In Progress"
- days in status "Test"
- days from start of development till done
