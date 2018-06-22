import { DateTimeFormatter } from 'js-joda';

import { loadIssueData } from '../jira-api/jira-api';
import { config } from '../../config';
import { JiraIssue } from '../jira-issue/jira-issue';
import { StoryPoints } from '../story-points/story-points';

const JIRA_PROJECT_KEY = config.projectKey;

export function issueStatsCommand(issueIds: number[]): void {
    const issueKeys = issueIds.map((id) => `${JIRA_PROJECT_KEY}-${id}`);
    issueKeys.forEach((key: string) => loadStatsForIssue(key));
}

function loadStatsForIssue(key: string): void {
    loadIssueData(key)
        .then((issueData: any) => {
            const issue = new JiraIssue(key, issueData);
            if (issue.isUserStory()) {
                printStatisticsForSubTasksOf(issue);
            } else {
                printStatisticsFor(issue);
            }
        })
}

function printStatisticsForSubTasksOf(issue: JiraIssue): void {
    issue.getSubtaskKeys().forEach((subtaskKey) => {
        loadIssueData(subtaskKey)
            .then((subtaskData: any) => {
                const subtask = new JiraIssue(subtaskKey, subtaskData);
                printStatisticsFor(subtask);
            })
    });
}

function printStatisticsFor(issue: JiraIssue): void {
    const key = issue.key;
    const storyPoints = StoryPoints[issue.getStoryPoints()];
    const startDate = issue.getStartDate() ? issue.getStartDate().format(DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm:ss')) : 'no start date';
    const durations = issue.getDurations();
    const inProgress = durations['In Progress'] || '';
    const test = durations['Test'] || '';
    const totalTime = issue.getTotalTime();
    console.log(`${key}, ${storyPoints}, ${startDate}, ${inProgress}, ${test}, ${totalTime}`);
}
