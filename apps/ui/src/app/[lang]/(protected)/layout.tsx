// app/[locale]/(protected)/layout.tsx
import { verifySession } from '@/app/lib/dal';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession(); // 🔐 auth check

  return <>{children}</>;
}
