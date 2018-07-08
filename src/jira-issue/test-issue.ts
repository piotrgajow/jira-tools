import * as _ from 'lodash';
import { convert, LocalDateTime } from 'js-joda';

export class TestIssue {

    constructor(
        private fields: any = { subtasks: [] },
        private changelog: any = { histories: [] },
    ) {
    }

    storyPoints(sp:number): TestIssue {
        this.fields.customfield_10008 = sp;
        return this;
    }

    history(field: string, date: LocalDateTime, from: string, to: string): TestIssue {
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

    type(typeName: string): TestIssue {
        this.fields.issuetype = { name: typeName };
        return this;
    }

    subtask(key: string): TestIssue {
        this.fields.subtasks.push({ key });
        return this;
    }

    build(): any {
        return _.assign<any, any>({}, this);
    }

}
