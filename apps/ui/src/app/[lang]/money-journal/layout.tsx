import { MoneyJournalFilterProvider } from '@/providers/MoneyJournalFilterContext';
import Providers from '@/providers/Providers';

export default function MoneyJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <MoneyJournalFilterProvider>{children}</MoneyJournalFilterProvider>
    </Providers>
  );
}
