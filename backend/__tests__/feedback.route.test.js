const request = require("supertest");
const axios = require("axios");

jest.mock("axios");

describe("POST /feedback", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    process.env.JIRA_BASE_URL = "https://example.atlassian.net";
    process.env.JIRA_EMAIL = "tester@example.com";
    process.env.JIRA_API_TOKEN = "token-123";
    process.env.JIRA_PROJECT_KEY = "ABC";
    process.env.JIRA_ISSUE_TYPE = "Task";
    ({ app } = require("../server"));
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

  test("bubbles up Jira error status", async () => {
    axios.post.mockRejectedValue({
      response: { status: 401, data: { errorMessages: ["Unauthorized"] } },
    });

    const res = await request(app)
      .post("/feedback")
      .send({ summary: "S", description: "D" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Error creating Jira issue");
  });

  test("returns 500 when Jira env vars are missing", async () => {
    jest.resetModules();
    delete process.env.JIRA_BASE_URL;
    const { app: freshApp } = require("../server");

    const res = await request(freshApp)
      .post("/feedback")
      .send({ summary: "S", description: "D" });

    expect(res.status).toBe(500);
    expect(res.body.missing).toContain("JIRA_BASE_URL");
  });
});
