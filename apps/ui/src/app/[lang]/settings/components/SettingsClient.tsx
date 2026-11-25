/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import CategoriesTab from './CategoriesTab';
import TagsTab from './TagsTab';
import AccountsTab from './AccountsTab';
import { SettingsTab } from './settingsTabs';

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
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        {pageText.TITLE}
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="categories"
          label={pageText.TABS.CATEGORIES}
          id="settings-tab-categories"
          aria-controls="settings-panel"
        />
        <Tab
          value="tags"
          label={pageText.TABS.TAGS}
          id="settings-tab-tags"
          aria-controls="settings-panel"
        />
        <Tab
          value="accounts"
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
