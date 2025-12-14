# AI Bridge Overview

This document describes the browser-side hooks and UI that let an external AI assistant interact with Dogalog without altering default behavior when offline.

## What Was Added

- **AI Helper panel** (`src/ui/aiChat.js`):
  - Optional chat box mounted in the right column.
  - Endpoint input (defaults to empty/offline). If no endpoint is set, the panel is inert and the rest of the app is unchanged.
  - “Send to AI” posts a JSON payload to the configured endpoint and displays the response.
  - “Apply Code” replaces the editor content with `codeSuggestion` from the AI (only when the user clicks).
  - “Run Query” sends `querySuggestion` to the REPL (only when clicked).

- **Config hook**:
  - `defaults.aiEndpoint` (empty by default) and optional `VITE_AI_ENDPOINT` env var to pre-set the endpoint.

- **Programmatic hooks already exposed**:
  - `window.dogalog.setCode(text)`: replace editor content and re-evaluate.
  - `window.dogalog.runQuery(query)`: execute a REPL query string.
  - `window.dogalog.getCode()`: read current editor text.
  - Custom events: dispatch `new CustomEvent('dogalog:setCode', { detail: '<code>' })` or `...('dogalog:query', { detail: '<query>' })`.
  - postMessage bridge (in `src/ui/aiBridge.js`): listen for messages with `{ source: 'dogalog-ai-bridge', action: 'setCode' | 'runQuery' | 'getCode', payload }`. Replies to `getCode` with `{ source: 'dogalog-ai-bridge', id, action: 'code', payload: '<code>' }`.

## How It Behaves When Offline

- If no endpoint is configured or a request fails, the AI panel shows “offline/request failed,” disables only the send button, and the rest of the app runs exactly as before (editor, scheduler, REPL, audio).
- The hooks (`window.dogalog`, custom events, postMessage bridge) are no-ops unless invoked.

## Expected AI Endpoint Contract

See `docs/ai-service-contract.md` for the full HTTP contract. Summary:
- `POST` JSON to the configured endpoint.
- Request: `{ prompt: string, code?: string }`.
- Response: `{ message: string, codeSuggestion?: string, querySuggestion?: string }`.
- Non-200 or network errors => UI shows offline/error; no changes applied.

## Minimal Usage Examples

- From devtools to set the endpoint manually (if not using env var):
  - Enter the endpoint in the AI panel input (e.g., `http://localhost:3001/chat`).

- Send code/query without the panel (custom events):
```js
window.dispatchEvent(new CustomEvent('dogalog:setCode', { detail: 'human(socrates).' }));
window.dispatchEvent(new CustomEvent('dogalog:query', { detail: 'mortal(X).' }));
```

- Use the postMessage bridge:
```js
window.postMessage({ source: 'dogalog-ai-bridge', action: 'setCode', payload: 'human(socrates).' }, '*');
window.postMessage({ source: 'dogalog-ai-bridge', action: 'runQuery', payload: 'mortal(X).' }, '*');
window.postMessage({ source: 'dogalog-ai-bridge', action: 'getCode', id: 'req1' }, '*');
// Listen for response with action: 'code' and matching id.
```

## Where to Look in Code

- Panel/UI: `src/ui/aiChat.js`, styles in `src/style.css`, mounted in `src/ui/template.js` and `src/app.js`.
- Hooks and bridge: `src/app.js` (exposes `window.dogalog` and custom event listeners), `src/ui/aiBridge.js` (postMessage bridge).
- Config: `src/config/defaults.js` and optional `VITE_AI_ENDPOINT`.
