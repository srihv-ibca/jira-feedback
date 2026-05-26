const { validateFeedback } = require("../src/validate");

describe("validateFeedback", () => {
  test("trims and returns normalized value", () => {
    const { value, error } = validateFeedback(
      { summary: "  hi  ", description: "  there  " },
      "Task"
    );
    expect(error).toBeUndefined();
    expect(value).toEqual({ summary: "hi", description: "there", issueType: "Task" });
  });

  test("uses provided issueType when set", () => {
    const { value } = validateFeedback(
      { summary: "s", description: "d", issueType: "Bug" },
      "Task"
    );
    expect(value.issueType).toBe("Bug");
  });

  test("falls back to default issueType when blank", () => {
    const { value } = validateFeedback(
      { summary: "s", description: "d", issueType: "   " },
      "Story"
    );
    expect(value.issueType).toBe("Story");
  });

  test("rejects missing fields", () => {
    expect(validateFeedback({ summary: "only" }, "Task").error).toMatch(/required/);
    expect(validateFeedback({}, "Task").error).toMatch(/required/);
  });

  test("rejects oversized summary", () => {
    const { error } = validateFeedback(
      { summary: "x".repeat(256), description: "ok" },
      "Task"
    );
    expect(error).toMatch(/255/);
  });
});
