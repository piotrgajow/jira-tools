const _ = require('lodash');
const { ChronoUnit,  LocalDateTime,  nativeJs } = require('js-joda');

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

class JiraIssue {

    constructor(key, data) {
        this.key = key;
        this.data = data;
    }

    getStoryPoints() {
        return _.get(this.data, PATH_STORY_POINTS);
    }

    getStartDate() {
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

    getTotalTime() {
        const startDate = this.getStartDate();
        const endDate = getEndDate(this.data);
        return startDate && endDate ? calculateTimeDifference(startDate, endDate) : undefined;
    }

    getDurations() {
        let status;
        let date;
        const durations = {};
        _.forEachRight(_.get(this.data, PATH_HISTORY_ITEMS), (history) => {
            const statusChange = history.items.find((item) => item.field === FIELD_HISTORY_ITEM_STATUS);
            if (statusChange) {
                if (status) {
                    durations[status] = (durations[status] || 0) + calculateTimeDifference(date, history.created);
                }
                status = statusChange.toString;
                date = history.created;
            }
        });
        return durations;
    }

    isUserStory() {
        return _.get(this.data, PATH_TYPE) === TYPE_USER_STORY;
    }

    getSubtaskKeys() {
        const subtasks = _.get(this.data, PATH_SUBTASKS);
        return subtasks ? subtasks.map((it) => it.key) : [];
    }

}

function calculateTimeDifference(fromString, toString) {
    const from = new Date(fromString);
    const to = new Date(toString);
    if (from.toDateString() === to.toDateString()) {
        const fromTime = LocalDateTime.from(nativeJs(from));
        const toTime = LocalDateTime.from(nativeJs(to));
        const hours = fromTime.until(toTime, ChronoUnit.HOURS);
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

function isWorkDay(date) {
    const SATURDAY = 6;
    const SUNDAY = 0;
    return date.getDay() !== SUNDAY && date.getDay() !== SATURDAY;
}

function dateToLocalDateTime(date) {
    return LocalDateTime.from(nativeJs(new Date(date)))
}

function getEndDate(data) {
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

module.exports = { JiraIssue };
