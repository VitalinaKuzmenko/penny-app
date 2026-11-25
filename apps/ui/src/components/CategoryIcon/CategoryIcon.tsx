'use client';

import { createElement } from 'react';
import { SvgIconProps } from '@mui/material';
import { getCategoryIconComponent } from './categoryIconComponents';

interface CategoryIconProps extends Omit<SvgIconProps, 'color'> {
  icon: string | null | undefined;
  // the category colour; the icon is tinted with it
  color?: string | null;
}

export default function CategoryIcon({
  icon,
  color,
  fontSize = 'small',
  sx,
  ...rest
}: CategoryIconProps) {
  // the components come from a static map, so nothing is created during render
  return createElement(getCategoryIconComponent(icon), {
    fontSize,
    sx: [
      { color: color ?? 'text.secondary' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ],
    ...rest,
  });
}
