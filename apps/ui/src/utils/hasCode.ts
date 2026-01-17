/* eslint-disable @typescript-eslint/no-explicit-any */
export const hasCode = (data: unknown): data is { code: string } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    typeof (data as any).code === 'string'
  );
};
