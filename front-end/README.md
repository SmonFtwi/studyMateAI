# StudyMate frontend

Next.js 14, React, TypeScript, Tailwind, and Radix UI. The interface defaults to dark mode and remembers theme preferences.

## Development

Set `NEXT_PUBLIC_backend_url` in `.env.local`, then run `npm install` and `npm run dev`.

To isolate a preview or build from a running dev server, use `NEXT_OUTPUT_DIR=.next-preview npm run dev -- --port 3010` or `NEXT_OUTPUT_DIR=.next-build npm run build`. The default output remains `.next`. Use the same `NEXT_OUTPUT_DIR` when running `npm start` for an isolated build.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

The API contract tests cover registration with and without email confirmation, registration failures, chat approval responses, and readable service errors. They use mocked responses and do not contact a backend.

## Redesign verification

The public, authentication, dashboard, and admin routes were inspected at 390px, 768px, and 1440px in both themes. Local API fixtures were used to exercise project search and creation, deletion confirmation/cancellation, file selection/upload and source refresh, chat history and failures, flashcard navigation, quiz scoring/restart, and study-state retention across tabs.

No live accounts or production data were changed. Responsive checks are not a substitute for testing with production data, very large source sets, or real authentication email delivery.

## Existing service limitations

The current FastAPI backend implements `/users/*` authentication and project study APIs. It does not currently implement legacy `/auth/*` recovery/admin, `/pdf/*` file management, or `/dash/*` analytics routes. Those screens retain their existing URLs and requests and show failure/retry states when unavailable. Password recovery retains `NEXT_PUBLIC_url` when set, falling back to the configured backend URL.

Profile photo upload and account deletion previously imported API helpers that did not exist. The profile now explicitly explains that photo updates are unavailable; the account deletion control is disabled. These capabilities require backend endpoints before they can be enabled. This redesign makes no backend changes.
