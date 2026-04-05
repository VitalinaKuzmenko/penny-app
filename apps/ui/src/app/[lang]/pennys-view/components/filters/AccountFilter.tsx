/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Account } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';

interface Props {
  accounts: Account[];
  pennysViewPageText: Record<string, any>;
}

const AccountFilter = ({ accounts, pennysViewPageText }: Props) => {
  const { filters, setFilters } = useDashboardFilters();

  const items = accounts.map((a) => ({
    id: a.id,
    label: a.name,
  }));

  return (
    <FilterMultiSelect
      label={pennysViewPageText.FILTERS.ACCOUNT_FILTER.LABEL}
      items={items}
      value={filters.accountIds}
      onChange={(accountIds) => setFilters({ accountIds })}
      minWidth={320}
    />
  );
};

export default AccountFilter;
