export const hexToRgba = (hex?: string | null, alpha = 0.15) => {
  if (!hex) return 'transparent';

  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
