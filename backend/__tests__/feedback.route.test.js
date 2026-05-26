const request = require("supertest");
const axios = require("axios");

jest.mock("axios");

// Env must be set BEFORE requiring the server, since toADF/route imports run at load time.
process.env.JIRA_BASE_URL = "https://example.atlassian.net";
process.env.JIRA_EMAIL = "tester@example.com";
process.env.JIRA_API_TOKEN = "token-123";
process.env.JIRA_PROJECT_KEY = "ABC";
process.env.JIRA_ISSUE_TYPE = "Task";

const { app } = require("../server");

describe("POST /feedback", () => {
  beforeEach(() => {
    // Restore Jira env in case a previous test removed it
    process.env.JIRA_BASE_URL = "https://example.atlassian.net";
    process.env.JIRA_EMAIL = "tester@example.com";
    process.env.JIRA_API_TOKEN = "token-123";
    process.env.JIRA_PROJECT_KEY = "ABC";
    process.env.JIRA_ISSUE_TYPE = "Task";
  });

  afterEach(() => jest.clearAllMocks());

  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("creates an issue and returns 201", async () => {
    axios.post.mockResolvedValue({ data: { key: "ABC-42" } });

    const res = await request(app)
      .post("/feedback")
      .send({ summary: "Login broken", description: "Cannot sign in." });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "Issue created successfully!",
      issueKey: "ABC-42",
    });
    expect(axios.post).toHaveBeenCalledTimes(1);

    const [url, body, opts] = axios.post.mock.calls[0];
    expect(url).toBe("https://example.atlassian.net/rest/api/3/issue");
    expect(body.fields.project).toEqual({ key: "ABC" });
    expect(body.fields.issuetype).toEqual({ name: "Task" });
    expect(opts.headers.Authorization).toMatch(/^Basic /);
  });

  test("honors issueType from body", async () => {
    axios.post.mockResolvedValue({ data: { key: "ABC-7" } });

    await request(app)
      .post("/feedback")
      .send({ summary: "S", description: "D", issueType: "Bug" });

    expect(axios.post.mock.calls[0][1].fields.issuetype).toEqual({ name: "Bug" });
  });

  test("returns 400 on missing fields", async () => {
    const res = await request(app).post("/feedback").send({ summary: "only" });
    expect(res.status).toBe(400);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("returns 400 on oversized summary", async () => {
    const res = await request(app)
      .post("/feedback")
      .send({ summary: "x".repeat(256), description: "ok" });
    expect(res.status).toBe(400);
  });

  test("bubbles up Jira error status when upstream responds with an error", async () => {
    axios.post.mockRejectedValue({
      response: { status: 401, data: { errorMessages: ["Unauthorized"] } },
    });

    const res = await request(app)
      .post("/feedback")
      .send({ summary: "S", description: "D" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Error creating Jira issue");
  });

  test("returns 502 when Jira is unreachable (no upstream response)", async () => {
    axios.post.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app)
      .post("/feedback")
      .send({ summary: "S", description: "D" });

    expect(res.status).toBe(502);
    expect(res.body.message).toBe("Error creating Jira issue");
    expect(res.body.error).toBe("ECONNREFUSED");
  });

  test("returns 500 when Jira env vars are missing", async () => {
    delete process.env.JIRA_BASE_URL;

    const res = await request(app)
      .post("/feedback")
      .send({ summary: "S", description: "D" });

    expect(res.status).toBe(500);
    expect(res.body.missing).toContain("JIRA_BASE_URL");
  });
});