const { toADF } = require("../src/jira/adf");

describe("toADF", () => {
  test("wraps text into Atlassian Document Format", () => {
    expect(toADF("hello")).toEqual({
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: "hello" }] },
      ],
    });
  });
});
