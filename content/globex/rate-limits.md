# Rate Limits

Hey {{user.name}}, here's what you need to know about our rate limiting.

## Default Limits

| Plan       | Requests/min | Burst |
|------------|-------------|-------|
| Free       | 60          | 10    |
| Pro        | 600         | 100   |
| Enterprise | Unlimited   | —     |

## Handling 429 Responses

When rate-limited, the response includes a `Retry-After` header:

```bash
curl -i https://api.globex.io/projects \
  -H "X-Api-Key: {{user.apiKey}}"
# HTTP/1.1 429 Too Many Requests
# Retry-After: 30
```

Implement exponential backoff in production code.
