# SocietyHub Profile Endpoints Contract

This document defines the exact backend contract for user and society profile endpoints implemented in the API.

Base URL: `https://societyhub-backend-production.up.railway.app/v1`

## Auth

All endpoints below are protected.
- JWT mode: requires `Authorization: Bearer <access_token>`
- Dev mode (`ALLOW_DEV_AUTH=true`): token may be omitted; backend uses `DEV_USER_ID`

## Shared Error Shape

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "instagramLink must point to an approved instagram domain.",
  "code": "VALIDATION_FAILED",
  "requestId": "29fa72cf-df00-4d48-b261-1d4bade5f9d5"
}
```

## User Profile Schema

```ts
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  university: string;
  course: string;
  year: string;
  bio: string | null;
  instagramLink: string | null;
  linkedinLink: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## Society Profile Schema

```ts
interface SocietyProfile {
  id: string;
  name: string;
  shortName: string;
  university: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  logoUrl: string | null;
  instagramLink: string | null;
  whatsappLink: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    memberships: number;
    events: number;
    polls: number;
    announcements: number;
  };
}
```

## Endpoints

## 1. GET /me
Alias: GET /users/me

Returns current user profile.

Success `200`:
```json
{
  "id": "m3",
  "email": "m3@societyhub.local",
  "fullName": "SocietyHub User",
  "university": "University of Manchester",
  "course": "Computer Science",
  "year": "Year 2",
  "bio": "I love hiking and joining tech societies!",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "avatarUrl": "https://cdn.societyhub.app/users/m3/avatar.jpg",
  "createdAt": "2026-04-12T15:21:00.000Z",
  "updatedAt": "2026-04-12T15:21:00.000Z"
}
```

Possible errors:
- `401 AUTH_TOKEN_REQUIRED`
- `401 AUTH_TOKEN_INVALID`
- `401 AUTH_SUBJECT_MISSING`

## 2. PATCH /me
Alias: PATCH /users/me

Updates current user profile.

Body (all fields optional):
```json
{
  "fullName": "John Doe",
  "university": "University of Manchester",
  "course": "Computer Science",
  "year": "Year 2",
  "bio": "I love hiking and joining tech societies!",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "avatarUrl": "https://cdn.societyhub.app/users/m3/avatar.jpg"
}
```

Validation rules:
- `fullName`: max 120
- `university`: max 120
- `course`: max 120
- `year`: max 40
- `bio`: max 500
- `avatarUrl`: must be valid `https://` URL
- `instagramLink`: must be `https://` and hostname `instagram.com` or `www.instagram.com`
- `linkedinLink`: must be `https://` and hostname `linkedin.com` or `www.linkedin.com`
- Empty strings are normalized to `null` for optional URL/text fields.

Success `200`: returns `UserProfile`.

Possible errors:
- `400 VALIDATION_FAILED`
- `401 AUTH_TOKEN_REQUIRED|AUTH_TOKEN_INVALID|AUTH_SUBJECT_MISSING`

## 3. GET /societies/:societyId

Returns full society profile.

Path params:
- `societyId: string`

Success `200`: returns `SocietyProfile`.

Possible errors:
- `404 SOCIETY_NOT_FOUND`
- `401 AUTH_TOKEN_REQUIRED|AUTH_TOKEN_INVALID|AUTH_SUBJECT_MISSING`

## 4. PATCH /societies/:societyId

Updates society profile.

Authz:
- Allowed roles in target society: `COMMITTEE` or `PRESIDENT`

Body (all fields optional):
```json
{
  "name": "Manchester Tech Society",
  "shortName": "MancTech",
  "university": "University of Manchester",
  "primaryColor": "#0B5FFF",
  "secondaryColor": "#00B894",
  "description": "We are the premier tech society on campus.",
  "logoUrl": "https://cdn.societyhub.app/societies/manc-tech/logo.png",
  "instagramLink": "https://instagram.com/manc_tech_soc",
  "whatsappLink": "https://chat.whatsapp.com/invite/xyz"
}
```

Validation rules:
- `name`: max 120
- `shortName`: max 20
- `university`: max 120
- `primaryColor`: valid hex color
- `secondaryColor`: valid hex color
- `description`: max 2000
- `logoUrl`: valid `https://` URL
- `instagramLink`: `https://` and hostname in instagram allowlist
- `whatsappLink`: `https://` and hostname in whatsapp allowlist (`chat.whatsapp.com`, `wa.me`, `whatsapp.com`, `www.whatsapp.com`)
- Empty strings are normalized to `null` for optional URL fields.

Success `200`: returns updated `SocietyProfile`.

Possible errors:
- `403 ROLE_INSUFFICIENT`
- `404 SOCIETY_NOT_FOUND`
- `400 VALIDATION_FAILED`
- `401 AUTH_TOKEN_REQUIRED|AUTH_TOKEN_INVALID|AUTH_SUBJECT_MISSING`

## Notes on Image Uploads

Current API expects `avatarUrl` and `logoUrl` as already-uploaded HTTPS URLs.

For production-grade media flow, preferred pattern:
1. Client uploads image via dedicated upload endpoint or signed URL flow.
2. Backend stores only final HTTPS CDN URL in profile fields.

This keeps profile endpoints fast, secure, and cache-friendly.
