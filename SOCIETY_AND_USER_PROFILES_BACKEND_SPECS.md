# Backend Specification: Society & User Profiles

To support the newly implemented Frontend features across **User Profiles** and **Society Profiles**, the Backend API needs to implement the following endpoints and data schemas.

## 1. User Profiles Extensions

Users can now natively edit extended profile metadata including their Bio, Instagram, LinkedIn, and uploaded Avatars.

### **Types & Schemas**
\`\`\`ts
interface UserProfile {
  id: string; // UUID
  fullName: string;
  email: string;[text](../society-hub-api/PROFILE_ENDPOINTS_CONTRACT.md) [text](../society-hub-api/FRONTEND_EXACT_ENDPOINT_SCHEMA.md)
  university: string;
  course: string;
  year: string;
  bio?: string | null;           // NEW
  instagramLink?: string | null; // NEW 
  linkedinLink?: string | null;  // NEW
  avatarUrl?: string | null;     // NEW (Standard HTTPS URL after Cloud/CDN upload)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
\`\`\`

### **Endpoints required**

#### \`GET /api/v1/users/me\`
- **Description:** Retrieve the authenticated user's profile.
- **Returns:** \`UserProfile\` object.

#### \`PATCH /api/v1/users/me\`
- **Description:** Update the authenticated user's profile.
- **Body:**
  \`\`\`json
  {
    "fullName": "John Doe",
    "course": "Computer Science",
    "year": "Year 2",
    "bio": "I love hiking and joining tech societies!",
    "instagramLink": "https://instagram.com/johndoe",
    "linkedinLink": "https://linkedin.com/in/johndoe"
  }
  \`\`\`
- **Returns:** The updated \`UserProfile\` object.
- **Note on Images:** If handling images via this endpoint as Base64 JSON strings (e.g. \`"avatarDataUri": "data:image/jpeg;base64,..."\`), you must intercept the string, push it directly to an S3/Azure Blob/GCS storage bucket, and save the resultant publicly accessible URL as \`avatarUrl\` in the database.

---

## 2. Society Profiles Extensions

Society Admins can modify their public-facing society profiles natively, injecting richer UI details such as high-resolution logos, detailed descriptions, and external social media/messaging links.

### **Types & Schemas**
\`\`\`ts
interface SocietyProfile {
  id: string; // UUID
  name: string;
  shortName: string;
  university: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string | null;   // Extends previous usage (longer limits recommended)
  logoUrl?: string | null;       // NEW (Standard HTTPS URL after Cloud/CDN upload)
  instagramLink?: string | null; // NEW
  whatsappLink?: string | null;  // NEW
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
\`\`\`

### **Endpoints required**

#### \`GET /api/v1/societies/:societyId\`
- **Description:** Retrieve the target society by ID (already partially existing in legacy apps, needs to output the new fields).
- **Returns:** \`SocietyProfile\` object.

#### \`PATCH /api/v1/societies/:societyId\`
- **Description:** Update an existing society's profile.
- **Auth Guard:** Requires the acting user to have \`"Committee"\` or \`"President"\` role permissions within the target \`societyId\`.
- **Body:**
  \`\`\`json
  {
    "description": "We are the premier tech society...",
    "instagramLink": "https://instagram.com/techsoc",
    "whatsappLink": "https://chat.whatsapp.com/invites...xyz"
    // "logoDataUri": "data:image/jpeg;base64,..." -> If handling base64 parsing directly in the JSON route
  }
  \`\`\`
- **Returns:** The updated \`SocietyProfile\` object.
- **Note on Images:** Identical pattern to User Profile avatars. If the frontend submits \`"logoDataUri": "data:image/jpeg;..."\`, the backend should buffer, process via standard bucket workflow, and assign the true CDN URL to \`logoUrl\`.

---

## Operations & Scale Caveats
- **Validation**: Ensure URLs like \`instagramLink\` and \`linkedinLink\` are validated using Regex to block malicious domains or injected scripts on the frontend.
- **Image Size Limits**: Since the React Native / Expo \`expo-image-picker\` handles Base64 resizing and compression parameters (\`quality: 0.5\`), image bounds shouldn't usually exceed 3-5 MB. The API Gateway (e.g. Nginx / AWS API Gateway) must raise \`client_max_body_size\` to an appropriate threshold if transmitting Base64 payloads directly via REST.
- **Multi-Part Alternative**: For higher performance, if the Base64 method stalls, introduce `POST /api/v1/upload` expecting \`multipart/form-data\` and return the CDN URL to the app first, then allow the React Native app to issue the respective \`PATCH\` request above containing only the exact URL string.
