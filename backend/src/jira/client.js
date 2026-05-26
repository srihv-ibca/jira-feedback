const axios = require("axios");
const { toADF } = require("./adf");

const REQUIRED_ENV = [
  "JIRA_BASE_URL",
  "JIRA_EMAIL",
  "JIRA_API_TOKEN",
  "JIRA_PROJECT_KEY",
];

function missingEnv() {
  return REQUIRED_ENV.filter((k) => !process.env[k]);
}

async function createIssue({ summary, description, issueType }) {
  const {
    JIRA_BASE_URL,
    JIRA_EMAIL,
    JIRA_API_TOKEN,
    JIRA_PROJECT_KEY,
  } = process.env;

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

  const response = await axios.post(
    `${JIRA_BASE_URL}/rest/api/3/issue`,
    {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary,
        description: toADF(description),
        issuetype: { name: issueType },
      },
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data;
}

module.exports = { createIssue, missingEnv };
