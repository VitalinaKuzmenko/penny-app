// app/penny/layout.tsx
import { FilterProvider } from '@/providers/FilterContext';
import Providers from '@/providers/Providers';

export default function PennysViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <FilterProvider>{children}</FilterProvider>
    </Providers>
  );
}
