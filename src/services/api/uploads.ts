import { apiRequest } from './client';

export type UploadKind = 'AVATAR' | 'SOCIETY_LOGO' | 'POST_IMAGE' | 'EVENT_POSTER';

type SignedUpload = {
  uploadUrl: string;
  token: string;
  path: string;
  /** Store this on the profile/society once the bytes are uploaded. */
  publicUrl: string;
};

/** Derived from the picked file so the stored object has the right MIME type. */
const contentTypeForUri = (uri: string): string => {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
};

/**
 * Uploads a locally-picked image and returns its public URL.
 *
 * The API signs a short-lived upload URL (the storage service key never
 * reaches the device), the bytes go straight to storage, and the caller then
 * PATCHes the returned `publicUrl` onto the profile or society.
 */
export async function uploadImage(
  localUri: string,
  kind: UploadKind,
  societyId?: string,
): Promise<string> {
  const contentType = contentTypeForUri(localUri);

  const signed = await apiRequest<SignedUpload>('/uploads/signed-url', {
    method: 'POST',
    body: { kind, contentType, ...(societyId ? { societyId } : {}) },
  });

  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Image upload failed with status ${uploadResponse.status}`);
  }

  return signed.publicUrl;
}
