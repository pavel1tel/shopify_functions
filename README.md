# Shopify Functions Project

This project contains Vercel Edge Functions for Shopify integration.

## VRM Lookup Edge Function

Location: `/api/vrm-lookup.ts`

A Vercel Edge Function that proxies requests to the VRM lookup service. Designed for use with Shopify proxy configuration.

### Usage

The function accepts query parameters and uses a constant URL path:

```
GET /api/vrm-lookup?vrm=<vehicle_registration_mark>
```

### Parameters

- `vrm` (required): Vehicle registration mark to lookup
- `username` (optional): Username for authentication (defaults to ASPGWS)
- `password` (optional): Password for authentication (defaults to FK6NG8E3)

### Example

```
GET /api/vrm-lookup?vrm=AB12CDE
```

### Response

Returns cleaned XML response from the VRM lookup service.

