const _ = require('lodash');
const { convert } = require('js-joda');

class TestIssue {

    constructor() {
        this.fields = { subtasks: [] };
        this.changelog = { histories: [] };
    }

    storyPoints(sp) {
        this.fields.customfield_10008 = sp;
        return this;
    }

    history(field, date, from, to) {
        const entry = {
            created: convert(date).toDate(),
            items: [
                {
                    field: field,
                    fromString: from,
                    toString: to,
                },
            ],
        };
        this.changelog.histories.push(entry);
        return this;
    }

    type(typeName) {
        this.fields.issuetype = { name: typeName };
        return this;
    }

    subtask(key) {
        this.fields.subtasks.push({ key });
        return this;
    }

    build() {
        return _.assign({}, this);
    }
}

module.exports = { TestIssue };
