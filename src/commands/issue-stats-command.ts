import { DateTimeFormatter } from 'js-joda';

import { loadIssueData } from '../jira-api/jira-api';
import { config } from '../../config';
import { JiraIssue } from '../jira-issue/jira-issue';
import { StoryPoints } from '../story-points/story-points';

const JIRA_PROJECT_KEY = config.projectKey;

export function issueStatsCommand(issueIds) {
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
    const storyPoints = StoryPoints[issue.getStoryPoints()];
    const startDate = issue.getStartDate().format(DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm:ss'));
    const durations = issue.getDurations();
    const inProgress = durations['In Progress'] || '';
    const test = durations['Test'] || '';
    const totalTime = issue.getTotalTime();
    console.log(`${key}, ${storyPoints}, ${startDate}, ${inProgress}, ${test}, ${totalTime}`);
}
