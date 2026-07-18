import { MaterialIcons } from '@expo/vector-icons';
import { LinkPlatform } from '@/services/api/users';

export type LinkPlatformMeta = {
  platform: LinkPlatform;
  /** Display name used on chips and in the add-link picker. */
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Placeholder shown in the URL field when adding this platform. */
  urlHint: string;
};

/**
 * Single source of truth for how each link platform is presented. MaterialIcons
 * has no brand glyphs, so each platform maps to the closest recognisable symbol.
 */
export const LINK_PLATFORM_META: Record<LinkPlatform, LinkPlatformMeta> = {
  instagram: { platform: 'instagram', name: 'Instagram', icon: 'photo-camera', urlHint: 'https://instagram.com/yourhandle' },
  snapchat: { platform: 'snapchat', name: 'Snapchat', icon: 'chat-bubble', urlHint: 'https://snapchat.com/add/yourhandle' },
  tiktok: { platform: 'tiktok', name: 'TikTok', icon: 'music-note', urlHint: 'https://tiktok.com/@yourhandle' },
  x: { platform: 'x', name: 'X', icon: 'alternate-email', urlHint: 'https://x.com/yourhandle' },
  linkedin: { platform: 'linkedin', name: 'LinkedIn', icon: 'work', urlHint: 'https://linkedin.com/in/yourhandle' },
  github: { platform: 'github', name: 'GitHub', icon: 'code', urlHint: 'https://github.com/yourhandle' },
  youtube: { platform: 'youtube', name: 'YouTube', icon: 'play-circle-outline', urlHint: 'https://youtube.com/@yourhandle' },
  spotify: { platform: 'spotify', name: 'Spotify', icon: 'library-music', urlHint: 'https://open.spotify.com/user/yourhandle' },
  website: { platform: 'website', name: 'Website', icon: 'language', urlHint: 'https://yoursite.com' },
  other: { platform: 'other', name: 'Other', icon: 'link', urlHint: 'https://example.com' },
};

/** Picker order — the socials students actually reach for come first. */
export const LINK_PLATFORM_ORDER: LinkPlatform[] = [
  'instagram',
  'snapchat',
  'tiktok',
  'x',
  'linkedin',
  'github',
  'youtube',
  'spotify',
  'website',
  'other',
];

/** Falls back gracefully if the backend ever adds a platform the app doesn't know. */
export function platformMeta(platform: LinkPlatform): LinkPlatformMeta {
  return LINK_PLATFORM_META[platform] ?? LINK_PLATFORM_META.other;
}

/**
 * The text shown on a link chip: the custom label for `other`, else the platform
 * name. Accepts both stored links and in-progress editor drafts.
 */
export function linkDisplayLabel(link: { platform: LinkPlatform; label?: string | null }): string {
  const trimmed = link.label?.trim();
  if (link.platform === 'other') {
    return trimmed && trimmed.length > 0 ? trimmed : 'Link';
  }
  return platformMeta(link.platform).name;
}
