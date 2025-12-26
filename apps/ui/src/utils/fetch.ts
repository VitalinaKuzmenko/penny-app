import { cookies } from 'next/headers';

const getHeaders = async () => ({
  Cookie: (await cookies()).toString(),
});

export const post = async (path: string, formData: FormData) => {
  const res = await fetch(`${process.env.SERVER_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await getHeaders()) },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: parsedRes.message };
  }
  return parsedRes;
};

// export const get = async (path: string) => {
//   const res = await fetch(`${process.env.SERVER_URL}/${path}`, {
//     headers: { ...(await getHeaders()) },
//   });

//   if (!res.ok) {
//     return await res.text();
//   }
//   return res.json();
// };

export const get = async (path: string): Promise<Response> => {
  return fetch(`${process.env.SERVER_URL}/${path}`, {
    headers: await getHeaders(),
    credentials: 'include',
  });
};
