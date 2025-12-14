'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { availableLanguages, LanguageType } from '../../utils/interfaces';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentLang = params.lang as LanguageType;

  const switchLanguage = (event: SelectChangeEvent) => {
    if (!pathname) return;

    const segments = pathname.split('/');

    // Replace the language segment
    segments[1] = event.target.value;

    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <div>
      <FormControl
        sx={{
          'm': 1,
          'minWidth': 50,

          '& .MuiOutlinedInput-root': {
            'color': 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
        }}
        size="small"
      >
        <Select
          value={currentLang}
          onChange={switchLanguage}
          displayEmpty
          sx={{
            'fontSize': 12,
            'height': 32,
            '& .MuiSelect-select': {
              padding: '1px 8px',
            },
          }}
        >
          {availableLanguages.map((lang) => (
            <MenuItem
              key={lang}
              value={lang}
            >
              {lang.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
