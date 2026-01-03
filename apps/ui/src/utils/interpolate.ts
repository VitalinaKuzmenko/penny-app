export const interpolate = (
  template: string,
  params?: Record<string, string | number>,
) => {
  if (!params) return template;

  return Object.entries(params).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template,
  );
};
