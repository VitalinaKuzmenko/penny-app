'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// Same draft → Apply pattern as the dashboard's FilterContext, with the
// Money Journal's own filters (refunds, search, uncategorised, tags, deleted rows)

export type MoneyJournalTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE' | 'REFUND';

// Pseudo category id for rows without a category
export const UNCATEGORISED_ID = '__uncategorised__';
// Pseudo tag id for rows without any tag
export const UNTAGGED_ID = '__untagged__';

export interface MoneyJournalFilters {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  // may include UNCATEGORISED_ID
  categoryIds: string[];
  accountIds: string[];
  // may include UNTAGGED_ID; nothing selected = no tag filter
  tagIds: string[];
  type: MoneyJournalTypeFilter;
  search: string;
  showDeleted: boolean;
}

interface MoneyJournalFilterContextProps {
  filters: MoneyJournalFilters; // draft
  appliedFilters: MoneyJournalFilters; // used by the table
  setFilters: (filters: Partial<MoneyJournalFilters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  isInitialized: boolean;
  initFilters: (data: { categoryIds: string[]; accountIds: string[] }) => void;
}

const defaultFilters = (): MoneyJournalFilters => ({
  startDate: dayjs().startOf('year'),
  endDate: dayjs().endOf('year'),
  categoryIds: [],
  accountIds: [],
  tagIds: [],
  type: 'ALL',
  search: '',
  showDeleted: false,
});

const MoneyJournalFilterContext = createContext<
  MoneyJournalFilterContextProps | undefined
>(undefined);

export const MoneyJournalFilterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [initial, setInitial] = useState<MoneyJournalFilters>(defaultFilters);
  const [filters, setFiltersState] =
    useState<MoneyJournalFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<MoneyJournalFilters>(defaultFilters);
  const [isInitialized, setIsInitialized] = useState(false);

  const setFilters = (newFilters: Partial<MoneyJournalFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  // back to "everything selected", not to an empty selection
  const resetFilters = () => {
    setFiltersState(initial);
  };

  const initFilters = ({
    categoryIds,
    accountIds,
  }: {
    categoryIds: string[];
    accountIds: string[];
  }) => {
    const defaults = { ...defaultFilters(), categoryIds, accountIds };

    setInitial(defaults);
    setFiltersState(defaults);
    setAppliedFilters(defaults);
    setIsInitialized(true);
  };

  return (
    <MoneyJournalFilterContext.Provider
      value={{
        filters,
        appliedFilters,
        setFilters,
        applyFilters,
        resetFilters,
        isInitialized,
        initFilters,
      }}
    >
      {children}
    </MoneyJournalFilterContext.Provider>
  );
};

export const useMoneyJournalFilters = () => {
  const context = useContext(MoneyJournalFilterContext);
  if (!context) {
    throw new Error(
      'useMoneyJournalFilters must be used within a MoneyJournalFilterProvider',
    );
  }
  return context;
};
