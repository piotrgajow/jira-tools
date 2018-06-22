import { LocalDateTime } from 'js-joda';

import { JiraIssue } from './jira-issue';
import { TestIssue } from './test-issue';

describe('JiraIssue', () => {

    const ISSUE_KEY = 'TEST-1';

    let subject;

    describe('getStoryPoints', () => {

        [
            { data: {}, expected: undefined },
            { data: new TestIssue().storyPoints(3).build(), expected: 3 },
            { data: new TestIssue().storyPoints(13).build(), expected: 13 },
        ].forEach(({ data, expected }) => {

            test('should return story point estimation', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.getStoryPoints();
                expect(result).toEqual(expected);
            });

        });

    });

    describe('getStartDate', () => {

        [
            { data: {}, expected: undefined },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 10, 14), 'To Do', 'In Progress')
                    .build(),
                expected: LocalDateTime.of(2018, 10, 14),
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 10, 17), 'To Do', 'In Progress')
                    .history('status', LocalDateTime.of(2018, 10, 17), 'In Progress', 'To Do')
                    .history('status', LocalDateTime.of(2018, 10, 16), 'To Do', 'In Progress')
                    .history('status', LocalDateTime.of(2018, 10, 15), 'In Progress', 'To Do')
                    .history('status', LocalDateTime.of(2018, 10, 14), 'To Do', 'In Progress')
                    .build(),
                expected: LocalDateTime.of(2018, 10, 14),
            },
        ].forEach(({ data, expected }) => {

            test('should return start date of issue', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.getStartDate();
                expect(result).toEqual(expected);
            });

        });

    });

    describe('getDurations', () => {

        [
            { data: {}, expected: {} },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 26, 8), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 25, 8), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 23, 8), 'Test', 'In Progress')
                    .history('status', LocalDateTime.of(2018, 4, 20, 8), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: { inProgress: 8, test: 4 },
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 16, 16), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 12), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: { inProgress: 0.5, test: 0.5 },
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 16, 20), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 14), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: { inProgress: 0.75, test: 0.75 },
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 17, 3), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 20), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: { inProgress: 1, test: 2 },
            },
        ].forEach(({ data, expected }) => {

            test('should return duration in different statuses', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.getDurations();
                expect(result['In Progress']).toEqual(expected.inProgress);
                expect(result['Test']).toEqual(expected.test);
            });

        });

    });

    describe('isUserStory', () => {

        [
            { data: {}, expected: false },
            { data: new TestIssue().type('Story').build(), expected: true },
            { data: new TestIssue().type('Sub-task').build(), expected: false },
        ].forEach(({ data, expected }) => {

            test('should return proper boolean value', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.isUserStory();
                expect(result).toEqual(expected);
            })

        });

    });

    describe('getSubtaskKeys', () => {

        [
            { data: {}, expected: [] },
            { data: new TestIssue().subtask('TEST-1').subtask('TEST-15').build(), expected: ['TEST-1', 'TEST-15'] },
        ].forEach(({ data, expected }) => {

            test('should return list of subtask keys', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.getSubtaskKeys();
                expect(result).toEqual(expected);
            });

        });

    });

    describe('getTotalTime', () => {

        [
            { data: {}, expected: undefined },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 26, 8), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 25, 8), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 23, 8), 'Test', 'In Progress')
                    .history('status', LocalDateTime.of(2018, 4, 20, 8), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: 9,
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 16, 16), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 12), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: 1,
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 16, 20), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 14), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: 1,
            },
            {
                data: new TestIssue()
                    .history('status', LocalDateTime.of(2018, 4, 17, 3), 'Test', 'Done')
                    .history('status', LocalDateTime.of(2018, 4, 16, 20), 'In Progress', 'Test')
                    .history('status', LocalDateTime.of(2018, 4, 16, 8), 'To Do', 'In Progress')
                    .build(),
                expected: 2,
            },
        ].forEach(({ data, expected }) => {

            test('should return total work time', () => {
                subject = new JiraIssue(ISSUE_KEY, data);
                const result = subject.getTotalTime();
                expect(result).toEqual(expected);
            });

        });

    });

});



