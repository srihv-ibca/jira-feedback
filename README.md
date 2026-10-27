# Jira Feedback

A small full-stack app that lets users submit feedback through a web form and creates a Jira issue from each submission(Initially developed  be part of ONS design system, now a standalone application). 

- **Backend** — Node.js + Express (`backend/`)
- **Frontend** — React + Sass (`client/`)
- **Tests** — Jest + supertest (backend), React Testing Library (frontend)

## Project layout

```
.
├── backend/
│   ├── server.js              # App wiring + listen
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── routes/feedback.js # POST /feedback handler
│   │   ├── jira/client.js     # Axios call to Jira
│   │   ├── jira/adf.js        # toADF helper
│   │   └── validate.js        # Request validation
│   └── __tests__/
│       ├── feedback.route.test.js
│       ├── validate.test.js
│       └── adf.test.js
└── client/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── components/
        │   ├── FeedbackForm.js
        │   ├── FeedbackForm.scss
        │   └── FeedbackForm.test.js
        └── styles/
            ├── _variables.scss
            ├── App.scss
            └── index.scss
```

## Prerequisites

- Node.js 18+
- A Jira Cloud project and an [API token](https://id.atlassian.com/manage-profile/security/api-tokens)

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your Jira credentials
npm start
```

Environment variables (`backend/.env`):

| Variable | Required | Description |
|---|---|---|
| `JIRA_BASE_URL` | yes | e.g. `https://your-domain.atlassian.net` |
| `JIRA_EMAIL` | yes | Atlassian account email |
| `JIRA_API_TOKEN` | yes | API token for the account |
| `JIRA_PROJECT_KEY` | yes | Project key issues are created under |
| `JIRA_ISSUE_TYPE` | no | Default issue type, defaults to `Task` |
| `PORT` | no | Server port, defaults to `3000` |
| `CORS_ORIGIN` | no | Allowed origin, defaults to `*` |

### API

- `GET /health` → `{ "status": "ok" }`
- `POST /feedback` — body:
  ```json
  { "summary": "Login broken", "description": "Cannot sign in", "issueType": "Bug" }
  ```
  - `201` → `{ "message": "...", "issueKey": "ABC-42" }`
  - `400` if `summary`/`description` missing or summary too long
  - `5xx` if Jira call fails (status mirrors Jira when available)

## Frontend setup

```bash
cd client
npm install
npm start
```

The dev server runs on `http://localhost:3001` and proxies API calls to `http://localhost:3000` (set in `client/package.json`).

To target a different backend URL, set `REACT_APP_API_URL` before `npm start`:

```bash
REACT_APP_API_URL=https://api.example.com/feedback npm start
```

## Running tests

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd client
npm test
```

## Notes

- The backend converts the plain-text `description` into Atlassian Document Format (ADF) before sending it to Jira.
- The frontend never sees Jira credentials — they live only in the backend's environment.
