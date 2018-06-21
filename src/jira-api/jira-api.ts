const request = require('request-promise-native');

import { config } from '../../config';

const JIRA_API_URL = `https://${config.baseUrl}/rest/api/2`;
const HEADERS = {
    Authorization: `Basic ${config.authToken}`
};

function loadIssueData(id) {
    return request(getOptions(`issue/${id}?expand=changelog`)).catch(console.log);
}

function getOptions(url) {
    return {
        method: 'GET',
        uri: `${JIRA_API_URL}/${url}`,
        headers: HEADERS,
        json: true,
    };
}

module.exports = { loadIssueData };
