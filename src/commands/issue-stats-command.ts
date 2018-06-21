const { DateTimeFormatter } = require('js-joda');

const { loadIssueData } = require('../jira-api/jira-api');
const { projectKey: JIRA_PROJECT_KEY } = require('../../config.json');
const { JiraIssue } = require('../jira-issue/jira-issue');
const { StoryPoints } = require('../story-points/story-point-mapper');

function issueStatsCommand(issueIds) {
    const issueKeys = issueIds.map((id) => `${JIRA_PROJECT_KEY}-${id}`);
    issueKeys.forEach((key) => loadStatsForIssue(key));
}

function loadStatsForIssue(key) {
    loadIssueData(key)
        .then((issueData) => {
            const issue = new JiraIssue(key, issueData);
            if (issue.isUserStory()) {
                printStatisticsForSubTasksOf(issue);
            } else {
                printStatisticsFor(issue);
            }
        })
}

function printStatisticsForSubTasksOf(issue) {
    issue.getSubtaskKeys().forEach((subtaskKey) => {
        loadIssueData(subtaskKey)
            .then((subtaskData) => {
                const subtask = new JiraIssue(subtaskKey, subtaskData);
                printStatisticsFor(subtask);
            })
    });
}

function printStatisticsFor(issue) {
    const key = issue.key;
    const storyPoints = StoryPoints.fromNumber(issue.getStoryPoints());
    const startDate = issue.getStartDate().format(DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm:ss'));
    const durations = issue.getDurations();
    const inProgress = durations['In Progress'] || '';
    const test = durations['Test'] || '';
    const totalTime = issue.getTotalTime();
    console.log(`${key}, ${storyPoints}, ${startDate}, ${inProgress}, ${test}, ${totalTime}`);
}

module.exports = { issueStatsCommand };
