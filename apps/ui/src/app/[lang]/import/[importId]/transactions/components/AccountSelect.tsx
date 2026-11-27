/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { AccountWithActivity } from 'schemas';
import TocRoundedIcon from '@mui/icons-material/TocRounded';
import ImportInfoItem from './ImportInfoItem';

import { formatDay } from '@/utils/formatAccountDates';

interface AccountSelectProps {
  pageText: Record<string, any>;
  accounts: AccountWithActivity[];
  value: string | null;
  onChange: (val: string) => void;
  onCreate: () => void;
}

export default function AccountSelect({
  pageText,
  accounts,
  value,
  onChange,
  onCreate,
}: AccountSelectProps) {
  const hasAccounts = accounts.length > 0;
  const { lang } = useParams<{ lang: string }>();
  const handleChange = (event: SelectChangeEvent) =>
    onChange(event.target.value);

  const handleCreateNew = () => {
    onCreate();
  };

  const describeLastDate = (acc: AccountWithActivity) =>
    acc.lastTransactionDate
      ? pageText.DATA_UP_TO.replace(
          '{date}',
          formatDay(acc.lastTransactionDate, lang),
        )
      : pageText.NO_TRANSACTIONS;

  const renderSelected = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.name} · ${describeLastDate(acc)}` : '';
  };

  // Two grid items (select, button) so the parent grid can line them up
  return (
    <>
      <Tooltip
        title={hasAccounts ? '' : `${pageText.TOOLTIP_NO_ACCOUNTS}`}
        placement="top"
      >
        {/* Tooltip requires a non-disabled wrapper */}
        <span style={{ width: '100%', minWidth: 0 }}>
          <ImportInfoItem
            icon={<TocRoundedIcon fontSize="inherit" />}
            label={pageText.LABEL}
            labelId="account-label"
          >
            <FormControl fullWidth size="small" disabled={!hasAccounts}>
              <Select
                value={value ?? ''}
                labelId="account-label"
                onChange={handleChange}
                renderValue={renderSelected}
              >
                {hasAccounts &&
                  accounts.map((acc) => (
                    <MenuItem
                      key={acc.id}
                      value={acc.id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'grey.200',
                        },
                      }}
                    >
                      <ListItemText
                        primary={acc.name}
                        secondary={describeLastDate(acc)}
                      />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </ImportInfoItem>
        </span>
      </Tooltip>

      <Tooltip title={pageText.CREATE_TOOLTIP}>
        <CustomButton
          variantType="outlined"
          onClick={handleCreateNew}
          // same height as the small selects next to it
          sx={{
            height: 40,
            whiteSpace: 'nowrap',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {pageText.CREATE_BUTTON}
        </CustomButton>
      </Tooltip>
    </>
  );
}
