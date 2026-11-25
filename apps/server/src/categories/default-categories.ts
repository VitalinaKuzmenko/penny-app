import { CategoryIconName } from 'schemas';

// Seeded name of the transfer category; it's recognised by `isTransfer`, so users can rename it
export const TRANSFER_CATEGORY_NAME = 'Internal Transfer';

export const DEFAULT_CATEGORIES: {
  name: string;
  icon: CategoryIconName;
  color: string;
  isTransfer?: boolean;
}[] = [
  { name: 'Home Food', icon: 'home', color: '#4CAF50' },
  { name: 'Outside Food', icon: 'restaurant', color: '#FF9800' },
  { name: 'Bills', icon: 'receipt', color: '#F44336' },
  { name: 'Games', icon: 'sports_esports', color: '#9C27B0' },
  { name: 'Transport', icon: 'directions_bus', color: '#03A9F4' },
  { name: 'Clothes, cosmetics', icon: 'checkroom', color: '#E91E63' },
  { name: 'Drugs', icon: 'medical_services', color: '#009688' },
  { name: 'Others', icon: 'category', color: '#607D8B' },
  {
    name: TRANSFER_CATEGORY_NAME,
    icon: 'swap_horiz',
    color: '#9E9E9E',
    isTransfer: true,
  },
];
