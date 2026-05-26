const express = require("express");
const { validateFeedback } = require("../validate");
const { createIssue, missingEnv } = require("../jira/client");

function feedbackRouter() {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const defaultIssueType = process.env.JIRA_ISSUE_TYPE || "Task";
    const { value, error } = validateFeedback(req.body, defaultIssueType);
    if (error) return res.status(400).json({ message: error });

    const missing = missingEnv();
    if (missing.length) {
      return res.status(500).json({
        message: "Server is missing required Jira configuration.",
        missing,
      });
    }

    try {
      const data = await createIssue(value);
      return res.status(201).json({
        message: "Issue created successfully!",
        issueKey: data.key,
      });
    } catch (err) {
      const status = err.response?.status || 502;
      return res.status(status).json({
        message: "Error creating Jira issue",
        error: err.response?.data || err.message,
      });
    }
  });

  return router;
}

module.exports = { feedbackRouter };
