import * as _ from 'lodash';
import { convert } from 'js-joda';

export class TestIssue {

    constructor(
        private fields: any = { subtasks: [] },
        private changelog: any = { histories: [] },
    ) {
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
