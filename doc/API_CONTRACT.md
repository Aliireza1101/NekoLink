# NekoLink API Contract

## 1. Overview

NekoLink exposes a JSON/HTTP API for user accounts, authentication, file uploads, temporary download links, and administrator-managed plans and users.

- **Base path:** `/api`
- **Default development port:** `8000`
- **Content type:** `application/json` for JSON requests and responses
- **Upload content type:** `multipart/form-data`
- **Download response:** binary file attachment
- **Authentication:** JWT supplied either as an HTTP-only `jwt` cookie or as a bearer token
- **Roles:** `USER`, `ADMIN`

The route behavior documented here is derived from the current Express routes, controllers, Sequelize models, and error handler.

## 2. Authentication

Authenticated endpoints accept either of the following:

```http
Cookie: jwt=<JWT>
```

or:

```http
Authorization: Bearer <JWT>
```

Successful signup, login, and password reset responses return a JWT and also set the `jwt` cookie. The cookie is configured as HTTP-only, `SameSite=Lax`, and non-secure in the current implementation.

### Authentication errors

| HTTP status | Response condition |
| --- | --- |
| `401` | No token was supplied to a required-authentication endpoint |
| `401` | Token is invalid, expired, or was issued before a password change |
| `403` | Authenticated user does not have the required role |

## 3. Common response envelopes

Successful JSON responses generally use one of these shapes:

```json
{
  "status": "success",
  "...": "payload"
}
```

Operational errors use:

```json
{
  "status": "fail",
  "message": "Description of the problem"
}
```

Validation errors use:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

In development mode, errors additionally include `stack` and `error` fields. In production mode, unexpected non-operational errors return:

```json
{
  "status": "error",
  "message": "something went wrong"
}
```

## 4. Authentication endpoints

### `POST /api/auth/signup`

Create a user account and sign in immediately.

#### Request body

```json
{
  "firstName": "string, 3–32 characters",
  "lastName": "string, optional, 3–32 characters when provided",
  "email": "valid email address",
  "password": "string, 8–32 characters"
}
```

#### Success: `201 Created`

```json
{
  "status": "success",
  "token": "JWT string",
  "me": {
    "firstName": "string",
    "lastName": "string or null",
    "email": "string"
  }
}
```

New users are assigned the plan whose title is `free` by the model hook, when that plan exists.

### `POST /api/auth/login`

Authenticate an existing user.

#### Request body

```json
{
  "email": "string",
  "password": "string"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "token": "JWT string",
  "me": {
    "firstName": "string",
    "lastName": "string or null",
    "email": "string"
  }
}
```

#### Errors

- `400` — `Email or password is missing`
- `401` — `Incorrect email or password`

### `POST /api/auth/forgot-password`

Generate a password-reset token and send it by email.

#### Request body

```json
{
  "email": "string"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "message": "Token was sent to your email"
}
```

The reset token expires after 15 minutes.

#### Errors

- `400` — `Please provide email`
- `400` — `Invalid email`
- `500` — email delivery failure

### `POST /api/auth/reset-password/:token`

Set a new password using a valid, unexpired reset token.

#### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `token` | string | Raw password-reset token received by the user |

#### Request body

```json
{
  "password": "string, 8–32 characters"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "token": "JWT string"
}
```

The endpoint also sets the authenticated `jwt` cookie.

#### Errors

- `400` — `Please provide both token and password`
- `404` — `Invalid or expired token`

## 5. Current-user endpoints

All endpoints in this section require authentication.

### `GET /api/me`

Return the authenticated user's profile and plan.

#### Success: `200 OK`

```json
{
  "status": "success",
  "me": {
    "firstName": "string",
    "lastName": "string or null",
    "email": "string",
    "role": "ADMIN",
    "plan": {
      "id": "integer",
      "title": "string",
      "maxUploadSize": "integer",
      "storageSize": "integer or null",
      "fileRetentionMinutes": "integer or null",
      "price": "integer"
    }
  }
}
```

The `role` property is included only for administrators.

### `PATCH /api/me`

Update the authenticated user's profile.

#### Request body

```json
{
  "firstName": "string, optional",
  "lastName": "string or null, optional",
  "email": "valid email address, optional"
}
```

#### Success: `200 OK`

Returns the same shape as `GET /api/me`.

### `DELETE /api/me`

Delete the authenticated user's account.

#### Request body

```json
{
  "password": "current password"
}
```

#### Success: `204 No Content`

The response has no JSON body.

#### Errors

- `400` — `Please enter your password to proceed`
- `401` — `Incorrect password`

## 6. Administrator user endpoints

All endpoints in this section require authentication and the `ADMIN` role.

### `GET /api/users`

Return all users, including their associated plans.

#### Success: `200 OK`

```json
{
  "status": "success",
  "users": [
    {
      "id": "integer",
      "firstName": "string",
      "lastName": "string or null",
      "email": "string",
      "role": "USER | ADMIN",
      "plan": {
        "id": "integer",
        "title": "string",
        "maxUploadSize": "integer",
        "storageSize": "integer or null",
        "fileRetentionMinutes": "integer or null",
        "price": "integer"
      }
    }
  ]
}
```

Sensitive password and password-reset fields are excluded by the default user scope.

### `GET /api/users/:id`

Return one user by numeric identifier.

#### Success: `200 OK`

```json
{
  "status": "success",
  "user": {
    "id": "integer",
    "firstName": "string",
    "lastName": "string or null",
    "email": "string",
    "role": "USER | ADMIN",
    "planId": "integer or null"
  }
}
```

#### Errors

- `404` — `User not found`

### `PATCH /api/users/:id`

Update an administrator-selected user.

#### Request body

```json
{
  "firstName": "string, optional",
  "lastName": "string or null, optional",
  "email": "valid email address, optional",
  "password": "string, optional, 8–32 characters",
  "role": "USER | ADMIN, optional",
  "planId": "integer, optional"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "user": {}
}
```

The `user` object follows the model's default scope and excludes sensitive password fields.

### `DELETE /api/users/:id`

Delete a user by identifier.

#### Success: `204 No Content`

## 7. File endpoints

### `POST /api/files`

Upload a file and create a download link. Authentication is optional. Anonymous uploads use the `free` plan; authenticated uploads use the user's assigned plan.

#### Request

Use `multipart/form-data` with the following fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | file | yes | File to upload |
| `expiresAt` | date-time string | no | Custom expiration. Applied for authenticated uploads and must be in the future and within the plan retention limit. |
| `password` | string | no | Download password, 8–32 characters when provided |

The upload size is limited by the active plan. For authenticated users, the effective limit is the smaller of the plan's maximum upload size and remaining storage.

#### Success: `200 OK`

```json
{
  "status": "success",
  "downloadLink": "http://host/api/files/<token>/download",
  "detail": "http://host/api/files/<token>"
}
```

#### Errors

- `400` — `Please upload a file`
- `400` — invalid expiration date
- `400` — expiration is beyond the plan retention limit
- `400` — multipart upload error, including file-size violations
- `500` — no usable plan is available

### `GET /api/files/:token`

Return public metadata for a non-expired, active download link.

#### Success: `200 OK`

```json
{
  "status": "success",
  "file": {
    "name": "original filename",
    "mimeType": "MIME type",
    "size": "integer bytes",
    "passwordRequired": "boolean"
  },
  "downloadLink": "http://host/api/files/<token>/download"
}
```

#### Errors

- `404` — `File not found` when the token is unknown, expired, or inactive

### `GET /api/files/:token/download`

Download a non-expired, active file. If the link is password protected, the current implementation checks `req.body.password`; clients that need protected downloads should use the POST form below.

#### Success: file response

The server sends the stored file as an attachment using its original filename.

#### Errors

- `404` — `File not found` when the token is unknown, expired, or inactive
- `403` — `Password is required`
- `403` — `Incorrect password`

### `POST /api/files/:token/download`

Download a non-expired, active file, optionally supplying the link password in JSON.

#### Request body for password-protected links

```json
{
  "password": "download password"
}
```

For links without a password, the body may be omitted.

#### Success

Binary file attachment with the original filename. Each successful download increments the link's `downloadCount`.

## 8. Plan endpoints

### `GET /api/plans`

Return all plans.

#### Success: `200 OK`

```json
{
  "status": "success",
  "plans": [
    {
      "id": "integer",
      "title": "string",
      "maxUploadSize": "integer",
      "storageSize": "integer or null",
      "fileRetentionMinutes": "integer or null",
      "price": "integer"
    }
  ]
}
```

Plan titles are normalized to lowercase before validation.

### `POST /api/plans`

Create a plan. Requires `ADMIN` authentication.

#### Request body

```json
{
  "title": "string",
  "maxUploadSize": "positive integer",
  "storageSize": "positive integer or null",
  "fileRetentionMinutes": "positive integer or null",
  "price": "non-negative integer"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "plan": {}
}
```

#### Errors

- `400` — validation failure
- `400` — plan title is already being used
- `401` — authentication required
- `403` — administrator role required

### `GET /api/plans/:id`

Return one plan by numeric identifier.

#### Success: `200 OK`

```json
{
  "status": "success",
  "plan": {}
}
```

#### Errors

- `404` — `Plan not found`

### `PATCH /api/plans/:id`

Update a plan. Requires `ADMIN` authentication.

#### Request body

```json
{
  "title": "string, optional",
  "maxUploadSize": "positive integer, optional",
  "storageSize": "positive integer or null, optional",
  "fileRetentionMinutes": "positive integer or null, optional",
  "price": "non-negative integer, optional"
}
```

#### Success: `200 OK`

```json
{
  "status": "success",
  "plan": {}
}
```

### `DELETE /api/plans/:id`

Delete a plan. Requires `ADMIN` authentication.

#### Success: `204 No Content`

## 9. Download-link management

These endpoints require authentication. A regular user may manage links belonging to their own files. Administrators may manage any link.

### `PATCH /api/download-links/:id`

Update selected properties of a download link.

#### Request body

At least one supported field should be supplied:

```json
{
  "isActive": "boolean, optional",
  "expiresAt": "date-time string or null, optional",
  "maxDownloads": "positive integer or null, optional",
  "downloadCount": "non-negative integer, optional"
}
```

Only the four fields above are copied into the update operation; other fields are ignored.

#### Success: `200 OK`

```json
{
  "status": "success",
  "data": {
    "downloadLink": {}
  }
}
```

#### Errors

- `400` — `Please provide a field to update on download link`
- `404` — `Download Link not found` when the link does not exist or is not owned by the user

### `DELETE /api/download-links/:id`

Delete a download link. Requires ownership or administrator role.

#### Success: `204 No Content`

## 10. Resource fields

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary identifier |
| `firstName` | string | Required, 3–32 characters |
| `lastName` | string/null | Optional, 3–32 characters when present |
| `email` | string | Required, unique, valid email |
| `role` | `USER` or `ADMIN` | Defaults to `USER` |
| `planId` | integer/null | Associated plan |
| `password` | string | Never returned by default scopes |
| `createdAt` | date-time | Model field |

### Plan

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary identifier |
| `title` | string | Required and unique; normalized lowercase |
| `maxUploadSize` | integer | Positive; byte limit used for an individual upload |
| `storageSize` | integer/null | Optional total storage limit |
| `fileRetentionMinutes` | integer/null | Optional retention period |
| `price` | integer | Non-negative |

### File

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary identifier |
| `originalName` | string | Client-provided original filename |
| `mimeType` | string | Uploaded MIME type |
| `size` | integer | Size in bytes |
| `expiresAt` | date-time/null | Optional expiration |
| `userId` | integer/null | Null for anonymous uploads |

### Download link

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary identifier |
| `token` | string | Unique public token |
| `isActive` | boolean | Defaults to `true` |
| `expiresAt` | date-time/null | Optional expiration |
| `maxDownloads` | integer/null | Optional positive limit |
| `downloadCount` | integer | Starts at `0` |
| `fileId` | integer | Associated file; generally omitted from serialized default-scope output |
| `password` | string | Stored hashed and not exposed in normal responses |

## 11. HTTP status summary

| Status | Meaning in this API |
| --- | --- |
| `200` | Successful read, update, authentication, upload, or plan creation |
| `201` | User account created |
| `204` | Successful delete with no response body |
| `400` | Missing input, validation failure, duplicate value, or upload error |
| `401` | Missing or invalid authentication, or invalid credentials |
| `403` | Insufficient role or download password failure |
| `404` | Resource missing, expired, inactive, or invalid reset token |
| `500` | Email delivery failure or unexpected server failure |

## 12. Implementation notes

- There is no documented API version prefix beyond `/api`.
- There is no pagination or query filtering implemented for user, plan, or file listing endpoints.
- File expiration is enforced when public metadata or download routes query the `notExpired` scope.
- A scheduled job removes expired files according to the application scheduler; the public API treats expired links as unavailable.
- The current download implementation reads a protected download password from the request body, so `POST /download` is the reliable contract for password-protected links.
- The API emits links using the request protocol and host, so deployment behind a proxy should preserve the expected host/protocol headers.
