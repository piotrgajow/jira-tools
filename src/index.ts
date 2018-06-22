#!/usr/bin/env node

import * as program from 'commander';

import { issueStatsCommand } from './commands/issue-stats-command';

program
    .version('0.0.1')
    .description('Jira toolbox');

program
    .command('encode <text>')
    .action((text) => {
        console.log(Buffer.from(text).toString('base64'));
    });

program
    .command('issue-stats [ids...]')
    .action((ids) => {
        issueStatsCommand(ids);
    });

program
    .parse(process.argv);
