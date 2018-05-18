#!/usr/bin/env node

const program = require('commander');

program
    .version('0.0.1')
    .description('Jira toolbox');

program
    .command('encode <text>')
    .action((text) => {
        console.log(Buffer.from(text).toString('base64'));
    });

program
    .parse(process.argv);
