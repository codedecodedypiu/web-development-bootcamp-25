# YouTube-like Commenting API

A small Express.js demo project that implements a YouTube-style comment API for videos. It's intentionally minimal and uses an in-memory `model/db.js` to store a sample user, subscriptions, and videos (with comments). The goal is educational: to show how routes, controllers, and middleware interact in a simple REST API.

This README explains the project structure, how the code works, how to run it, example requests/responses, the bug that was found (and how to avoid it), and recommended next steps.

---

## Table of contents

- Project overview
- Tech stack
- File structure and responsibilities
- Data model (in `model/db.js`)
- Routes and controller behavior
- Middleware explanation
- How to run
- Example requests (curl)
- Known bug and fix (explanation)
- Suggested improvements and tests

---

## Project overview

This small project exposes an endpoint under `/watch` to:
- GET video details by query `v` (video id)
- POST a new comment to a video
- PUT edit an existing comment (by the same user)
- DELETE remove a comment (by the same user)

It uses a simple in-memory JavaScript object/array as the datastore found in `backend/model/db.js`. This keeps the demo focused on routing and controller logic rather than persistence.

## Tech stack

- Node.js
- Express 5.x

## File structure and responsibilities

```
backend-code/
  index.js                    # App entry — sets up express, middleware, routes
  package.json                # Node project config
  controller/
    watch.controller.js       # Controller logic for /watch endpoints
  middleware/
    authentication.middleware.js # Simple header-based auth middleware
  model/
    db.js                     # In-memory "database": user, subscriptions, videos
  routes/
    watch.routes.js           # Express Router with GET/POST/PUT/DELETE for comments
```

Key points:
- Routes are mounted at `/watch` (`index.js` does `app.use('/watch', watchRouter)`).
- `watch.controller.js` contains `exports.getVideoDetails` which reads query param `v` and returns the matched video (adds a runtime `commentCount` property).
- `model/db.js` exports named properties (see Data model section).

## Data model (backend/model/db.js)

`model/db.js` exports three named values:
- `kshitij` — an object `{ username, password, channelId }` representing the sample user
- `kshitijSubscriptions` — an array of channel names
- `videos` — an array of video objects. Each video object contains:
  - `videoId` (string)
  - `channelName` (string)
  - `likeCount` (number)
  - `comments` (array of comment objects)

A comment object has:
- `user` (string)
- `commentedOn` (timestamp)
- `data` (string)
- `isEdited` (boolean)
- `isDeleted` (boolean)

This is an in-memory JS module; it resets each time the server restarts.

## Routes and controller behavior

All routes live in `backend-code/routes/watch.routes.js` and are handled partially by `watch.controller.js`.

- GET /watch?v=<videoId>
  - Reads `v` from query string.
  - Finds the video in the `videos` array and returns it with `commentCount` (the number of comments).
  - If not found, responds with 404 and `{ message: "This video isn't available anymore" }`.

- POST /watch?v=<videoId>
  - Body JSON: `{ user, commentedOn, data }`.
  - Finds the video by `videoId` and pushes the new comment into `video.comments`.
  - Responds 201 with `{ message: "Comment Posted!" }` on success or 400 on failure.

- PUT /watch?v=<videoId>
  - Body JSON: `{ user, commentedOn, data }`.
  - Finds the video and updates the comment where comment.user matches the provided `user`. Sets `isEdited = true`.
  - Responds 201 with `{ message: "Comment Edited!" }` on success or 400 on failure.

- DELETE /watch?v=<videoId>
  - Body JSON: `{ user }`.
  - Finds the video and removes the comment whose `user` matches using `splice`.
  - Responds 204 with `{ message: "Comment Deleted!" }` on success or 400 on failure.

Notes about status codes:
- The DELETE route returns 204 but still includes a JSON message — a 204 response must not include a body in strict HTTP semantics; it's small demo code and can be adjusted to 200 or 204 without body.

## Middleware

`backend/middleware/authentication.middleware.js` is a tiny header-based middleware that:
- Reads `username` and `password` from request headers
- Compares them to the sample `kshitij` user in `model/db.js`
- Calls `next()` when they match, otherwise responds with 400 and `{ message: 'Incorrect Credentials!' }`

This middleware is not currently wired into all routes by default; the demo shows it available for protecting routes if you choose to use it.

## How to run

From the project root (`/web-development-bootcamp-25`):

1. Install dependencies (if not installed):

```bash
cd backend-code
npm install
```

2. Start the server (there's a `start` script configured in `backend/package.json`):

```bash
# from backend-code/
npm start

# or run directly (the repo used node --watch in script):
node --watch index.js
```

The server will listen on port 3000. You'll see `Server running on PORT: 3000` in the terminal.

## Example requests

Replace `localhost:3000` with your host if different.

- Get video details (example):

```bash
curl -i "http://localhost:3000/watch?v=abc"
```

Successful response body (200):

```json
{
  "videoId": "abc",
  "channelName": "Finance With Sharan",
  "likeCount": 1800,
  "comments": [
    {
      "user": "@kalyanchakravarthi9207",
      "commentedOn": 169...,
      "data": "I loved this conversation...",
      "isEdited": false,
      "isDeleted": false
    }
  ],
  "commentCount": 1
}
```

- Post a comment:

```bash
curl -i -X POST "http://localhost:3000/watch?v=abc" \
  -H "Content-Type: application/json" \
  -d '{"user":"@alice","commentedOn": 163..., "data":"Great video!"}'
```

- Edit a comment (PUT):

```bash
curl -i -X PUT "http://localhost:3000/watch?v=abc" \
  -H "Content-Type: application/json" \
  -d '{"user":"@alice","commentedOn": 163..., "data":"Edited comment"}'
```

- Delete a comment:

```bash
curl -i -X DELETE "http://localhost:3000/watch?v=abc" \
  -H "Content-Type: application/json" \
  -d '{"user":"@alice"}'
```

If you want to use the authentication middleware, send headers `username` and `password` with each request matching the values in `model/db.js` (username: `kshitij`, password: `Temp@123`).

## The bug we found and fixed (educational)

Root cause:
- `model/db.js` exports named properties:
  - `exports.kshitij = { ... }`
  - `exports.kshitijSubscriptions = [...]`
  - `exports.videos = [...]`

- In several files the code did `const videos = require('../model/db')` (or similar). That assigns the entire module object to `videos`, not the `videos` array. Later code attempted to treat `videos` like an array (e.g., `videos.length`, `videos[i]`), which fails because `videos` was the module object.

Fix:
- Destructure the named exports when requiring the module. Example:

```js
const { kshitij, kshitijSubscriptions, videos } = require('../model/db')
```

or import just what you need:

```js
const { videos } = require('../model/db')
```

This ensures `videos` is the array exported from `model/db.js`, not the module object.

Why this is a common gotcha:
- `require('./module')` returns the object assigned to `module.exports` (or `exports`). If a module attaches named properties (via `exports.foo = ...`), `require()` returns the whole object — you must access properties from it, or destructure them on import.

## Suggested improvements

- Replace the in-memory `model/db.js` with a proper datastore (SQLite, MongoDB, or JSON file during learning) so data persists across restarts.
- Add validation on inputs (e.g., ensure `v` is provided in query string and body fields exist) and return 400 for bad input.
- Protect mutating endpoints with `authenticationMiddleware` or a real token-based auth (JWT).
- Make the DELETE endpoint return 200 and body or use 204 with no body to follow semantics.
- Add unit tests for controllers (happy and unhappy paths) and integration tests for routes (supertest).
- Consider moving the `commentCount` computation into a helper or compute in the client; avoid mutating the returned video object on each request.

## Tests and quick checks

A minimal test approach:
- Add `jest` and `supertest` and write a test that starts the app and hits each route with an in-memory store.

## Final notes

This project is an excellent small learning example to understand how express controllers and routers interact and how a simple in-memory model can be used for prototyping. The bug you already encountered is a classic Node.js `require`/`exports` gotcha and is a good teaching point about module exports.

If you'd like, I can:
- Add a small test suite (with `jest` and `supertest`) covering GET/POST/PUT/DELETE flows.
- Add basic input validation (using `express-validator`).
- Convert the in-memory DB to a small JSON-backed persistence layer.

---

Thank you — tell me which improvements you'd like me to implement next and I can create PR-style changes for them.
