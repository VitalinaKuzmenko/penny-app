/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Paper, Typography } from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import { useParams } from 'next/navigation';
import {
  CategoryBreakdownResponse,
  GetIncomeExpenseResponse,
  IncomeExpenseStackedResponse,
} from 'schemas';
import { formatCurrencyLabel } from '@/utils/formatCurrency';
import { interpolate } from '@/utils/interpolate';
import stars from '../../../../../public/stars.png';
import crown from '../../../../../public/crown.png';
import calendar from '../../../../../public/calendar.png';

interface InsightCardsProps {
  // all three come from the charts above; null while loading or on error
  incomeExpense: GetIncomeExpenseResponse | null;
  categoryBreakdown: CategoryBreakdownResponse | null;
  monthlyTotals: IncomeExpenseStackedResponse | null;
  pennysViewPageText: Record<string, any>;
}

interface Insight {
  key: string;
  title: string;
  text: string;
  bg: string;
  icon: StaticImageData;
}

const LOCALES: Record<string, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  ua: 'uk-UA',
};

export default function InsightCards({
  incomeExpense,
  categoryBreakdown,
  monthlyTotals,
  pennysViewPageText,
}: InsightCardsProps) {
  const { lang } = useParams<{ lang: string }>();
  const text = pennysViewPageText.INSIGHTS;
  const insights: Insight[] = [];

  // Cards without data are left out so nothing reads blank
  if (incomeExpense) {
    // The API reports savings as 0 when expenses exceed income, so this card
    // switches to a neutral message instead of "You saved 0%"
    const saved = incomeExpense.income > 0 && incomeExpense.savings > 0;
    insights.push({
      key: 'saved',
      title: saved
        ? interpolate(text.SAVED_TITLE, {
            percent: Math.round(
              (incomeExpense.savings / incomeExpense.income) * 100,
            ),
          })
        : text.NO_SAVINGS_TITLE,
      text: saved
        ? interpolate(text.SAVED_TEXT, {
            amount: formatCurrencyLabel(incomeExpense.savings),
          })
        : interpolate(text.NO_SAVINGS_TEXT, {
            income: formatCurrencyLabel(incomeExpense.income),
            expense: formatCurrencyLabel(Math.abs(incomeExpense.expense)),
          }),
      bg: 'linear-gradient(135deg, #F0F5E8 0%, #E5E9DA 100%)',
      icon: stars,
    });
  }

  const topCategory = categoryBreakdown?.categories
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)[0];
  if (topCategory) {
    insights.push({
      key: 'category',
      title: interpolate(text.TOP_CATEGORY_TITLE, {
        name: topCategory.categoryName,
      }),
      text: interpolate(text.TOP_CATEGORY_TEXT, {
        amount: formatCurrencyLabel(topCategory.amount),
        percent: Math.round(topCategory.percentage),
      }),
      bg: 'linear-gradient(135deg, #FEE7E5 0%, #FBE3E7 100%)',
      icon: crown,
    });
  }

  const spendingMonths = (monthlyTotals ?? [])
    .map((m) => ({ ...m, expense: Math.abs(m.expense) }))
    .filter((m) => m.expense > 0);
  if (spendingMonths.length) {
    const top = spendingMonths.reduce((best, m) =>
      m.expense > best.expense ? m : best,
    );
    const [year, month] = top.month.split('-').map(Number);
    const spansYears =
      new Set(spendingMonths.map((m) => m.month.slice(0, 4))).size > 1;
    const monthLabel = new Date(year, month - 1).toLocaleString(
      LOCALES[lang] ?? 'en-GB',
      spansYears ? { month: 'long', year: 'numeric' } : { month: 'long' },
    );
    insights.push({
      key: 'month',
      title: interpolate(text.TOP_MONTH_TITLE, { month: monthLabel }),
      text: interpolate(text.TOP_MONTH_TEXT, {
        amount: formatCurrencyLabel(top.expense),
      }),
      bg: 'linear-gradient(135deg, #F6EEFC 0%, #EDE0F9 100%)',
      icon: calendar,
    });
  }

  if (!insights.length) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          lg: `repeat(${insights.length}, minmax(0, 1fr))`,
        },
      }}
    >
      {insights.map((insight) => (
        <Paper
          key={insight.key}
          elevation={0}
          sx={{
            borderRadius: '20px',
            background: insight.bg,
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box sx={{ width: 44, flexShrink: 0, display: 'flex' }}>
            <Image
              src={insight.icon}
              alt=""
              aria-hidden
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} color="secondary.main">
              {insight.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {insight.text}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
