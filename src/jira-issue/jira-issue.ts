import * as _ from 'lodash';
import { ChronoUnit, convert, LocalDateTime, nativeJs } from 'js-joda';

const PATH_STORY_POINTS = 'fields.customfield_10008';
const PATH_HISTORY_ITEMS = 'changelog.histories';
const PATH_TYPE = 'fields.issuetype.name';
const PATH_SUBTASKS = 'fields.subtasks';

const FIELD_HISTORY_ITEM_STATUS = 'status';
const FIELD_HISTORY_ITEM_CREATED = 'created';

const STATUS_TO_DO = 'To Do';
const STATUS_IN_PROGRESS = 'In Progress';
const STATUS_DONE = 'Done';

const TYPE_USER_STORY = 'Story';

const WORK_HOURS_PER_DAY = 8;

export class JiraIssue {

    constructor(
        public key: string,
        private data: any,
    ) {
    }

    getStoryPoints(): number {
        return _.get(this.data, PATH_STORY_POINTS);
    }

    getStartDate(): LocalDateTime {
        const history = _.get(this.data, PATH_HISTORY_ITEMS, []);
        const startHistoryItem = _.findLast(history, (it) => {
            const item = it.items[0];
            return item.field === FIELD_HISTORY_ITEM_STATUS &&
                item.fromString === STATUS_TO_DO &&
                item.toString === STATUS_IN_PROGRESS;
        });

        const startDate = _.get(startHistoryItem, FIELD_HISTORY_ITEM_CREATED);
        return startDate ? dateToLocalDateTime(startDate) : undefined;
    }

    getTotalTime(): number {
        const startDate = this.getStartDate();
        const endDate = getEndDate(this.data);
        return startDate && endDate ? calculateTimeDifference(startDate, endDate) : undefined;
    }

    getDurations(): any {
        let status: string;
        let date: LocalDateTime;
        const durations = {};
        _.forEachRight(_.get(this.data, PATH_HISTORY_ITEMS), (history) => {
            const statusChange = history.items.find((item) => item.field === FIELD_HISTORY_ITEM_STATUS);
            if (statusChange) {
                const statusDate = history.created ? dateToLocalDateTime(history.created) : undefined;
                if (status) {
                    durations[status] = (durations[status] || 0) + calculateTimeDifference(date, statusDate);
                }
                status = statusChange.toString;
                date = statusDate;
            }
        });
        return durations;
    }

    isUserStory(): boolean {
        return _.get(this.data, PATH_TYPE) === TYPE_USER_STORY;
    }

    getSubtaskKeys(): string[] {
        const subtasks = _.get(this.data, PATH_SUBTASKS);
        return subtasks ? subtasks.map((it) => it.key) : [];
    }

}

function calculateTimeDifference(fromDate: LocalDateTime, toDate: LocalDateTime): number {
    const from = convert(fromDate).toDate();
    const to = convert(toDate).toDate();
    if (from.toDateString() === to.toDateString()) {
        const hours = fromDate.until(toDate, ChronoUnit.HOURS);
        return hours > WORK_HOURS_PER_DAY ? 1 : hours / WORK_HOURS_PER_DAY;
    } else {
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        let days = 1;
        while (from < to) {
            if (isWorkDay(from)) {
                days++;
            }
            from.setDate(from.getDate() + 1);
        }
        return days;
    }
}

function isWorkDay(date: Date): boolean {
    const SATURDAY = 6;
    const SUNDAY = 0;
    return date.getDay() !== SUNDAY && date.getDay() !== SATURDAY;
}

function dateToLocalDateTime(date: Date): LocalDateTime {
    return LocalDateTime.from(nativeJs(new Date(date)))
}

function getEndDate(data: any): LocalDateTime {
    const history = _.get(data, PATH_HISTORY_ITEMS, []);
    const endHistoryItem = _.findLast(history, (it) => {
        return _.some(it.items, (item) => {
            return item.field === FIELD_HISTORY_ITEM_STATUS &&
                item.toString === STATUS_DONE;
        });
    });

    const endDate = _.get(endHistoryItem, FIELD_HISTORY_ITEM_CREATED);
    return endDate ? dateToLocalDateTime(endDate) : undefined;
}
