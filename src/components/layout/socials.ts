import { env } from '@/lib/env';
export const socials = {
  instagram: env.VITE_SOCIAL_INSTAGRAM,
  facebook: env.VITE_SOCIAL_FACEBOOK,
  linkedin: env.VITE_SOCIAL_LINKEDIN,
  youtube: env.VITE_SOCIAL_YOUTUBE,
};
export const hasSocialLinks = Object.values(socials).some(Boolean);
