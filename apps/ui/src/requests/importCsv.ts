import { ImportCsvResponse, ImportCsvResponseSchema } from 'schemas';

export async function uploadCsvFile(file: File): Promise<ImportCsvResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/import/csv`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    },
  );

  if (!response.ok) {
    console.log('response', response);
    const error = await response.json().catch(() => ({}));
    throw error;
  }

  const data = await response.json();

  // ✅ Runtime validation
  return ImportCsvResponseSchema.parse(data);
}
