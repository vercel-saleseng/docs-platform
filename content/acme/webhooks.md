# Webhooks

Hi {{user.name}}, here's how to set up webhooks for real-time event delivery.

## Configuration

Register your endpoint in the dashboard under **Settings → Webhooks**. Events are signed with your webhook secret.

```bash
curl -X POST https://api.acme.dev/v1/webhooks \
  -H "Authorization: Bearer {{user.apiKey}}" \
  -d '{"url": "https://yourapp.com/hooks", "events": ["widget.created"]}'
```

## Verifying Signatures

Every webhook includes an `X-Acme-Signature` header. Verify it before processing:

```js
import { verifySignature } from "@acme/sdk";

const isValid = verifySignature(payload, signature, secret);
```
