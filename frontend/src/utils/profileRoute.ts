const collapseWhitespace = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

export const slugifyProfileName = (name?: string): string => {
  if (!name) return '';

  const normalized = collapseWhitespace(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized;
};

export const profileSlugToName = (slug: string): string =>
  collapseWhitespace(decodeURIComponent(slug).replace(/-/g, ' '));

export const isUuidLike = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export const extractUserIdFromProfileSlug = (
  profileSlug?: string | null
): string | null => {
  if (!profileSlug) return null;

  const decodedSlug = decodeURIComponent(profileSlug);
  const parts = decodedSlug.split('--');
  const candidate = parts[parts.length - 1];

  if (isUuidLike(candidate)) {
    return candidate;
  }

  if (isUuidLike(decodedSlug)) {
    return decodedSlug;
  }

  return null;
};

export const buildProfilePath = (user?: {
  id?: string | null;
  name?: string | null;
}): string => {
  if (!user?.id) {
    return '/profile';
  }

  const slug = slugifyProfileName(user.name ?? undefined);
  const safeSlug = slug || 'user';
  return `/profile/${safeSlug}--${encodeURIComponent(user.id)}`;
};
