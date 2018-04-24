const request = require('request-promise-native');

const { baseUrl, authToken } = require('../../config.json');

const JIRA_API_URL = `https://${baseUrl}/rest/api/2`;
const HEADERS = {
    Authorization: `Basic ${authToken}`
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
