export const shopPalettes = {
  light: {
    background: '#F6F7F2',
    border: '#DDE4DA',
    card: '#FFFFFF',
    chip: '#EDF2EA',
    hero: '#173D2B',
    heroMuted: '#BFE7D0',
    muted: '#667064',
    primary: '#177A4D',
    primarySoft: '#E5F5EC',
    sale: '#F36C3D',
    shadow: '#132118',
    text: '#152018',
    warning: '#F4B942',
  },
  dark: {
    background: '#101512',
    border: '#2B362F',
    card: '#18201B',
    chip: '#222C25',
    hero: '#CDEFD9',
    heroMuted: '#486354',
    muted: '#A6B1A8',
    primary: '#65D494',
    primarySoft: '#193A28',
    sale: '#FF8A5C',
    shadow: '#050705',
    text: '#F4F7F2',
    warning: '#F6CF67',
  },
} as const;

export type ShopPalette = (typeof shopPalettes)[keyof typeof shopPalettes];
