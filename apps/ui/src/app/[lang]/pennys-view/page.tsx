import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import MainDashboard from './components/MainDashboard';
import { getAccounts } from '@/requests/getAccounts';
import { getCategories } from '@/requests/getCategories';
import { Account, Category } from 'schemas';
import { UiError } from '@/types/interfaces';

export const dynamic = 'force-dynamic';

export default async function PennysViewPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

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
      errors.push({
        severity: 'error',
        title: `Failed to load ${['accounts', 'categories'][index]}`,
        message: `Could not fetch ${
          ['accounts', 'categories'][index]
        }. Please try refresh the page.`,
      });
    }
  });

  return (
    <Container maxWidth="xl">
      <MainDashboard
        accounts={accounts}
        categories={categories}
        serverErrors={errors}
      />
    </Container>
  );
}
