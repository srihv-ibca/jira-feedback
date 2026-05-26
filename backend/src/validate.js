const SUMMARY_MAX = 255;

function validateFeedback(body, defaultIssueType) {
  const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const issueType =
    typeof body?.issueType === "string" && body.issueType.trim()
      ? body.issueType.trim()
      : defaultIssueType;

  if (!summary || !description) {
    return { error: "Both 'summary' and 'description' are required." };
  }
  if (summary.length > SUMMARY_MAX) {
    return { error: `'summary' must be ${SUMMARY_MAX} characters or fewer.` };
  }
  return { value: { summary, description, issueType } };
}

module.exports = { validateFeedback, SUMMARY_MAX };
