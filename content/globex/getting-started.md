# Globex API Quickstart

Hello {{user.name}}! Let's get you up and running with the Globex platform.

## Your API Key

Use your personal key for all requests:

```bash
curl https://api.globex.io/projects \
  -H "X-Api-Key: {{user.apiKey}}"
```

## Creating a Project

```js
const res = await fetch("https://api.globex.io/projects", {
  method: "POST",
  headers: { "X-Api-Key": "{{user.apiKey}}" },
  body: JSON.stringify({ name: "My First Project" }),
});
```
