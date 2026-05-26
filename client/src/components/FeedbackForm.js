import React, { useState } from "react";
import "./FeedbackForm.scss";

const ISSUE_TYPES = ["Task", "Bug", "Story"];
const API_URL = process.env.REACT_APP_API_URL || "/feedback";

function FeedbackForm() {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("Task");
  const [status, setStatus] = useState({ state: "idle" });

  const isValid = summary.trim().length > 0 && description.trim().length > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || status.state === "submitting") return;

    setStatus({ state: "submitting" });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary.trim(),
          description: description.trim(),
          issueType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      setStatus({ state: "success", issueKey: data.issueKey });
      setSummary("");
      setDescription("");
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      <label className="feedback-form__field">
        <span>Summary</span>
        <input
          type="text"
          name="summary"
          maxLength={255}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Short title for your issue"
          required
        />
      </label>

      <label className="feedback-form__field">
        <span>Issue type</span>
        <select
          name="issueType"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
        >
          {ISSUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="feedback-form__field">
        <span>Description</span>
        <textarea
          name="description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? Steps to reproduce, expected vs actual..."
          required
        />
      </label>

      <button
        type="submit"
        className="feedback-form__submit"
        disabled={!isValid || status.state === "submitting"}
      >
        {status.state === "submitting" ? "Sending..." : "Send feedback"}
      </button>

      {status.state === "success" && (
        <p role="status" className="feedback-form__message feedback-form__message--success">
          Issue created: <strong>{status.issueKey}</strong>
        </p>
      )}
      {status.state === "error" && (
        <p role="alert" className="feedback-form__message feedback-form__message--error">
          {status.message}
        </p>
      )}
    </form>
  );
}

export default FeedbackForm;
