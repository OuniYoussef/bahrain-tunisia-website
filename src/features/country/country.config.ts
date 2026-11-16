const sectionOrder = [
  'welcome',
  'destinations',
  'wear',
  'nature',
  'cities',
  'history',
  'festive',
  'food',
  'monuments',
] as const;
export const COUNTRY = {
  tunisia: {
    ns: 'tunisia',
    theme: 'tunisia',
    map: 'map-tunisia.svg',
    flag: 'flag-tunisia.svg',
    divider: 'arch',
    sectionOrder,
  },
  bahrain: {
    ns: 'bahrain',
    theme: 'bahrain',
    map: 'map-bahrain.svg',
    flag: 'flag-bahrain.svg',
    divider: 'serrated',
    sectionOrder,
  },
} as const;
export type Country = keyof typeof COUNTRY;
export type CountrySection = (typeof sectionOrder)[number];
