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
      const labels = [
        dict.DASHBOARD_PAGE.FILTERS.ACCOUNT_FILTER.LABEL,
        dict.DASHBOARD_PAGE.FILTERS.CATEGORY_FILTER.LABEL,
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
      <MainDashboard
        accounts={accounts}
        categories={categories}
        serverErrors={errors}
        pennysViewPageText={dict.DASHBOARD_PAGE}
      />
    </Container>
  );
}
