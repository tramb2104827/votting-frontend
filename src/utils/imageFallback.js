const createSvgFallback = (label, width = 800, height = 1000) => {
  const safeLabel = (label || 'No Image').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#e8f5f3"/>
          <stop offset="100%" stop-color="#d7f0ed"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="50%" cy="34%" r="18%" fill="#bfe7e2"/>
      <path d="M 30 74 C 50 52, 70 52, 100 74 L 100 100 L 30 100 Z" fill="#a7dcd5"/>
      <text x="50%" y="76%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#0f6b5f">${safeLabel}</text>
    </svg>
  `)}`;
};

export const getSafeImageUrl = (type = 'candidate') => {
  const label = type === 'election' ? 'Election' : 'Candidate';
  return createSvgFallback(label);
};

export const sanitizeImageUrl = (value, type = 'candidate') => {
  if (!value || typeof value !== 'string') return getSafeImageUrl(type);
  const trimmed = value.trim();
  if (!trimmed) return getSafeImageUrl(type);
  if (/^data:image\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) return trimmed;
  return getSafeImageUrl(type);
};

export default getSafeImageUrl;
