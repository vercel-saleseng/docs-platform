# Getting Started with Acme API

Welcome, {{user.name}}! This guide will help you integrate with the Acme API.

## Authentication

All requests require your API key in the `Authorization` header:

```bash
curl -H "Authorization: Bearer {{user.apiKey}}" \
  https://api.acme.dev/v1/widgets
```

## Quick Start

Install the SDK and initialize it with your credentials:

```js
import { Acme } from "@acme/sdk";

const client = new Acme({ apiKey: "{{user.apiKey}}" });
const widgets = await client.widgets.list();
```
