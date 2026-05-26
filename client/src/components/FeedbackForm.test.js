import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackForm from "./FeedbackForm";

describe("FeedbackForm", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("submit button is disabled until both fields are filled", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm />);

    const submit = screen.getByRole("button", { name: /send feedback/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/summary/i), "Hello");
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/description/i), "Details here");
    expect(submit).toBeEnabled();
  });

  test("submits payload and shows the returned issue key", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ issueKey: "ABC-99" }),
    });
    const user = userEvent.setup();
    render(<FeedbackForm />);

    await user.type(screen.getByLabelText(/summary/i), "Login broken");
    await user.type(screen.getByLabelText(/description/i), "Cannot sign in");
    await user.selectOptions(screen.getByLabelText(/issue type/i), "Bug");
    await user.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("ABC-99")
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      summary: "Login broken",
      description: "Cannot sign in",
      issueType: "Bug",
    });
  });

  test("shows error message when the backend rejects the request", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Validation failed" }),
    });
    const user = userEvent.setup();
    render(<FeedbackForm />);

    await user.type(screen.getByLabelText(/summary/i), "x");
    await user.type(screen.getByLabelText(/description/i), "y");
    await user.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed")
    );
  });

  test("clears the form after a successful submission", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ issueKey: "ABC-1" }),
    });
    const user = userEvent.setup();
    render(<FeedbackForm />);

    const summary = screen.getByLabelText(/summary/i);
    const description = screen.getByLabelText(/description/i);

    await user.type(summary, "S");
    await user.type(description, "D");
    await user.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(summary).toHaveValue("");
    expect(description).toHaveValue("");
  });
});
