# Initech Developer Guide

Welcome aboard, {{user.name}}. This guide covers the basics of our TPS Report API.

## Authentication

Include your API key as a query parameter:

```bash
curl "https://api.initech.com/v2/reports?key={{user.apiKey}}"
```

## Fetching Reports

```js
const response = await fetch(
  `https://api.initech.com/v2/reports?key={{user.apiKey}}`
);
const reports = await response.json();
```
