/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PageHero from '@/components/PageHero/PageHero';
import CategoriesTab from './CategoriesTab';
import TagsTab from './TagsTab';
import AccountsTab from './AccountsTab';
import { SettingsTab } from './settingsTabs';

const tabSx = {
  minHeight: 48,
  px: 3,
  fontSize: '1rem',
  borderRadius: 999,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  color: 'text.primary',
  transition: 'all 0.2s ease',
  '&:hover': { bgcolor: 'grey.100' },
  '&.Mui-selected': {
    bgcolor: 'sidebar.activeBackground',
    borderColor: 'secondary.light',
    color: 'secondary.main',
  },
};

interface SettingsClientProps {
  initialTab: SettingsTab;
  // SETTINGS_PAGE
  pageText: Record<string, any>;
}

export default function SettingsClient({
  initialTab,
  pageText,
}: SettingsClientProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  const handleChange = (_: unknown, value: SettingsTab) => {
    setTab(value);
    // keep the tab on reload without a server round trip
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState(null, '', url);
  };

  return (
    <Box>
      <PageHero title={pageText.TITLE} subtitle={pageText.SUBTITLE} />

      <Tabs
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          position: 'relative',
          zIndex: 1,
          mb: 3,
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTabs-flexContainer': { gap: 1.5 },
        }}
      >
        <Tab
          value="categories"
          icon={<LayersOutlinedIcon />}
          iconPosition="start"
          sx={tabSx}
          label={pageText.TABS.CATEGORIES}
          id="settings-tab-categories"
          aria-controls="settings-panel"
        />
        <Tab
          value="tags"
          icon={<LocalOfferOutlinedIcon />}
          iconPosition="start"
          sx={tabSx}
          label={pageText.TABS.TAGS}
          id="settings-tab-tags"
          aria-controls="settings-panel"
        />
        <Tab
          value="accounts"
          icon={<AccountBalanceOutlinedIcon />}
          iconPosition="start"
          sx={tabSx}
          label={pageText.TABS.ACCOUNTS}
          id="settings-tab-accounts"
          aria-controls="settings-panel"
        />
      </Tabs>

      <Box
        role="tabpanel"
        id="settings-panel"
        aria-labelledby={`settings-tab-${tab}`}
      >
        {tab === 'categories' && <CategoriesTab text={pageText} />}
        {tab === 'tags' && <TagsTab text={pageText} />}
        {tab === 'accounts' && <AccountsTab text={pageText} />}
      </Box>
    </Box>
  );
}
