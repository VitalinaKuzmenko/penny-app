import { z } from 'zod';

// Curated category icons, stored by name; the UI maps each name to its MUI icon
export const CATEGORY_ICON_GROUPS = {
  food: [
    'restaurant',
    'local_grocery_store',
    'local_cafe',
    'fastfood',
    'local_pizza',
    'bakery_dining',
    'local_bar',
  ],
  home: [
    'home',
    'bolt',
    'water_drop',
    'wifi',
    'chair',
    'cleaning_services',
    'local_laundry_service',
    'build',
  ],
  transport: [
    'directions_bus',
    'directions_car',
    'local_gas_station',
    'train',
    'flight',
    'local_taxi',
    'pedal_bike',
    'local_parking',
  ],
  shopping: [
    'shopping_bag',
    'checkroom',
    'spa',
    'devices',
    'phone_iphone',
    'card_giftcard',
  ],
  health: ['medical_services', 'local_pharmacy', 'fitness_center', 'favorite'],
  fun: [
    'sports_esports',
    'movie',
    'music_note',
    'menu_book',
    'sports_soccer',
    'beach_access',
    'hotel',
    'celebration',
  ],
  finance: [
    'receipt',
    'payments',
    'credit_card',
    'account_balance',
    'savings',
    'request_quote',
    'subscriptions',
    'swap_horiz',
  ],
  people: [
    'family_restroom',
    'child_care',
    'school',
    'work',
    'pets',
    'volunteer_activism',
  ],
  other: ['category', 'star', 'more_horiz'],
} as const;

export type CategoryIconGroup = keyof typeof CATEGORY_ICON_GROUPS;

export type CategoryIconName =
  (typeof CATEGORY_ICON_GROUPS)[CategoryIconGroup][number];

export const CATEGORY_ICONS = Object.values(CATEGORY_ICON_GROUPS).flat() as [
  CategoryIconName,
  ...CategoryIconName[],
];

// Pre-selected for a new category, and shown when a stored name is missing or unknown
export const DEFAULT_CATEGORY_ICON: CategoryIconName = 'category';

export const CategoryIconSchema = z.enum(CATEGORY_ICONS);
