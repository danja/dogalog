# AI Service Contract

This describes the minimal HTTP contract the Dogalog AI helper expects. The UI remains fully functional if the endpoint is missing or offline; failures should be handled gracefully by the client.

## Endpoint

- **Method:** `POST`
- **URL:** configurable; defaults to empty (offline). Recommended default for local development: `http://localhost:3001/chat`.
- **Content-Type:** `application/json`

## Request Body

```json
{
  "prompt": "string, required",
  "code": "string, optional (current editor contents)"
}
```

- `prompt` is the user’s message to the AI.
- `code` is the current Prolog program; the AI can use this for context when suggesting changes or answering questions.

## Response Body

```json
{
  "message": "string, required",
  "codeSuggestion": "string, optional",
  "querySuggestion": "string, optional"
}
```

- `message`: human-readable response to display in the chat panel.
- `codeSuggestion`: full program text to offer via “Apply Code” (replaces the editor content when the user clicks Apply).
- `querySuggestion`: query text to offer via “Run Query” (sends to the REPL when clicked).

## Error Handling

- Non-200 responses or network errors should be treated as “offline”. Return an error status with a JSON body:

```json
{ "message": "description of the error" }
```

## Example Interaction

Request:
```http
POST /chat
Content-Type: application/json

{
  "prompt": "Make a four-on-the-floor kick and a simple hat",
  "code": "existing dogalog program..."
}
```

Response:
```json
{
  "message": "Try this basic groove with kick on 1/4 and hats on 1/8.",
  "codeSuggestion": "kick(T) :- euc(T,4,16,4,0).\nhat(T) :- every(T,0.5).\nevent(kick,36,1.0,T) :- kick(T).\nevent(hat,80,0.7,T) :- hat(T).",
  "querySuggestion": "event(V, P, _, 0)."
}
```

## Notes for Implementers

- CORS: allow the Dogalog origin (or `*` during development).
- Authentication: if you require an API key, return a clear `401/403` JSON error; the UI will show “offline” when the request fails.
- Idempotence: each request is independent; the client does not hold a session.
- Size: keep responses small (a few KB). The client does not stream responses today.
