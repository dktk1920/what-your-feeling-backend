export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return '/';
  return base.endsWith('/') ? base : `${base}/`;
}
