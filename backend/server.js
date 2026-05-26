const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { feedbackRouter } = require("./src/routes/feedback");

const { PORT = 3000, CORS_ORIGIN = "*" } = process.env;

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cors({ origin: CORS_ORIGIN }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/feedback", feedbackRouter());

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app };
