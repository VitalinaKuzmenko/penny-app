import TransactionsClient from './components/TransactionsClient';
import { getAccounts } from '@/requests/getAccounts';
import { getCategories } from '@/requests/getCategories';
import { getCurrencies } from '@/requests/getCurrencies';
import { getImportRows } from '@/requests/getImportRows';
import {
  Account,
  Category,
  CsvImportResponse,
  GetCurrenciesResponse,
} from 'schemas';
import { LanguageType } from '@/utils/interfaces';
import { UiError } from '@/types/interfaces';

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ importId: string; lang: LanguageType }>;
}) {
  const { importId, lang } = await params;

  // fetch all in parallel, but settle promises individually
  const results = await Promise.allSettled([
    getImportRows(importId),
    getAccounts(),
    getCategories(),
    getCurrencies(),
  ]);

  console.log('results', results);

  let rows: CsvImportResponse[] = [];
  let accounts: Account[] = [];
  let categories: Category[] = [];
  let currencies: GetCurrenciesResponse = {
    currencies: [
      {
        code: 'USD',
      },
    ],
  };

  const errors: UiError[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      switch (index) {
        case 0:
          rows = result.value as CsvImportResponse[];
          break;
        case 1:
          accounts = result.value as Account[];
          break;
        case 2:
          categories = result.value as Category[];
          break;
        case 3:
          currencies = result.value as GetCurrenciesResponse;
          break;
      }
    } else {
      errors.push({
        severity: 'error',
        title: `Failed to load ${
          ['transactions', 'accounts', 'categories', 'currencies'][index]
        }`,
        message: `Could not fetch ${
          ['transactions', 'accounts', 'categories', 'currencies'][index]
        }. Please try refresh the page.`,
      });
    }
  });

  const serverError = errors.length > 0 ? errors[0] : null;

  return (
    <TransactionsClient
      rows={rows}
      accounts={accounts}
      categories={categories}
      currencies={currencies}
      serverError={serverError}
    />
  );
}
