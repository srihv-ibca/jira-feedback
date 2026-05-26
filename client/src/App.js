import React from "react";
import FeedbackForm from "./components/FeedbackForm";
import "./styles/App.scss";

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Jira Feedback</h1>
        <p>Send a ticket straight to our backlog.</p>
      </header>
      <main className="app__main">
        <FeedbackForm />
      </main>
    </div>
  );
}

export default App;
