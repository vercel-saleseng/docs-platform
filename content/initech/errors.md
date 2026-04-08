# Error Handling

Hi {{user.name}}, here's how to handle errors from the Initech API.

## Error Format

All errors return a JSON body with a `code` and `message`:

```json
{
  "code": "TPS_MISSING_COVER",
  "message": "TPS report is missing its cover sheet."
}
```

## Common Errors

| Code                  | Status | Meaning                          |
|-----------------------|--------|----------------------------------|
| `AUTH_INVALID_KEY`    | 401    | Your API key is invalid          |
| `TPS_MISSING_COVER`  | 422    | Cover sheet not attached         |
| `RATE_EXCEEDED`       | 429    | Slow down, {{user.name}}        |

Use your key `{{user.apiKey}}` to test error responses in sandbox mode.
