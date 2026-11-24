import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import { getAccounts } from '@/requests/getAccounts';
import { getCategories } from '@/requests/getCategories';
import { Account, Category } from 'schemas';
import { UiError } from '@/types/interfaces';
import MoneyJournalClient from './components/MoneyJournalClient';

export const dynamic = 'force-dynamic';

export default async function MoneyJournalPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const pageText = dict.MONEY_JOURNAL_PAGE;

  const results = await Promise.allSettled([getAccounts(), getCategories()]);

  let accounts: Account[] = [];
  let categories: Category[] = [];

  const errors: UiError[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      switch (index) {
        case 0:
          accounts = result.value as Account[];
          break;
        case 1:
          categories = result.value as Category[];
          break;
      }
    } else {
      const labels = [
        pageText.FILTERS.ACCOUNT_FILTER.LABEL,
        pageText.FILTERS.CATEGORY_FILTER.LABEL,
      ];

      errors.push({
        severity: 'error',
        title: `Failed to load ${labels[index]}`,
        message: `Could not fetch ${labels[index]}. Please try refreshing the page.`,
      });
    }
  });

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, md: 3 },
        maxWidth: { xs: '100%', md: 'xl' },
      }}
    >
      <MoneyJournalClient
        accounts={accounts}
        categories={categories}
        serverErrors={errors}
        pageText={pageText}
      />
    </Container>
  );
}
