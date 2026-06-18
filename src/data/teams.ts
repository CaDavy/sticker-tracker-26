import { Team, Sticker } from '../types';

const COUNTRY_ORDER = [
  'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI', 'BRA', 'MAR',
  'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW', 'CIV', 'ECU',
  'NED', 'JPN', 'SWE', 'TUN', 'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV',
  'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG', 'AUT', 'JOR',
  'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN'
];

const COUNTRY_NAMES: Record<string, string> = {
  MEX: 'Mexico', RSA: 'Zuid-Afrika', KOR: 'Zuid-Korea', CZE: 'Tsjechi\u00eb',
  CAN: 'Canada', BIH: 'Bosni\u00eb en Herzegovina', QAT: 'Qatar', SUI: 'Zwitserland',
  BRA: 'Brazili\u00eb', MAR: 'Marokko', HAI: 'Ha\u00efti', SCO: 'Schotland',
  USA: 'Verenigde Staten', PAR: 'Paraguay', AUS: 'Australi\u00eb', TUR: 'Turkije',
  GER: 'Duitsland', CUW: 'Cura\u00e7ao', CIV: 'Ivoorkust', ECU: 'Ecuador',
  NED: 'Nederland', JPN: 'Japan', SWE: 'Zweden', TUN: 'Tunesi\u00eb', BEL: 'Belgi\u00eb',
  EGY: 'Egypte', IRN: 'Iran', NZL: 'Nieuw-Zeeland', ESP: 'Spanje', CPV: 'Kaapverdi\u00eb',
  KSA: 'Saudi-Arabi\u00eb', URU: 'Uruguay', FRA: 'Frankrijk', SEN: 'Senegal', IRQ: 'Irak',
  NOR: 'Noorwegen', ARG: 'Argentini\u00eb', ALG: 'Algerije', AUT: 'Oostenrijk', JOR: 'Jordani\u00eb',
  POR: 'Portugal', COD: 'DR Congo', UZB: 'Oezbekistan', COL: 'Colombia', ENG: 'Engeland',
  CRO: 'Kroati\u00eb', GHA: 'Ghana', PAN: 'Panama'
};

const COUNTRY_COLORS: Record<string, string> = {
  MEX: '#006847', RSA: '#007749', KOR: '#C60C30', CZE: '#11457E', CAN: '#D80621',
  BIH: '#002395', QAT: '#8D1B3D', SUI: '#DA291C', BRA: '#009C3B', MAR: '#C1272D',
  HAI: '#00209F', SCO: '#005EB8', USA: '#BF0A30', PAR: '#D52B1E', AUS: '#00843D',
  TUR: '#E30A17', GER: '#000000', CUW: '#00247D', CIV: '#FF9A00', ECU: '#FFD100',
  NED: '#FF4F00', JPN: '#BC002D', SWE: '#006AA7', TUN: '#E70013', BEL: '#000000',
  EGY: '#C8102E', IRN: '#239F40', NZL: '#00247D', ESP: '#C60B1E', CPV: '#003893',
  KSA: '#006C35', URU: '#0038A8', FRA: '#0055A4', SEN: '#00853F', IRQ: '#007A3D',
  NOR: '#EF2B2D', ARG: '#75AADB', ALG: '#006233', AUT: '#ED2939', JOR: '#007A3D',
  POR: '#006600', COD: '#007FFF', UZB: '#1EB53A', COL: '#FCD116', ENG: '#CF081F',
  CRO: '#171796', GHA: '#006B3F', PAN: '#DA291C'
};

const COUNTRY_FLAGS: Record<string, string> = {
  MEX: '\ud83c\uddf2\ud83c\uddfd', RSA: '\ud83c\uddff\ud83c\udde6', KOR: '\ud83c\uddf0\ud83c\uddf7', CZE: '\ud83c\udde8\ud83c\uddff', CAN: '\ud83c\udde8\ud83c\udde6',
  BIH: '\ud83c\udde7\ud83c\udde6', QAT: '\ud83c\uddf6\ud83c\udde6', SUI: '\ud83c\udde8\ud83c\udded', BRA: '\ud83c\udde7\ud83c\uddf7', MAR: '\ud83c\uddf2\ud83c\udded',
  HAI: '\ud83c\udded\ud83c\uddf9', SCO: '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f', USA: '\ud83c\uddfa\ud83c\uddf8', PAR: '\ud83c\uddf5\ud83c\uddfe', AUS: '\ud83c\udde6\ud83c\uddfa',
  TUR: '\ud83c\uddf9\ud83c\uddf7', GER: '\ud83c\udde9\ud83c\uddea', CUW: '\ud83c\udde8\ud83c\uddfd', CIV: '\ud83c\udde8\ud83c\uddee', ECU: '\ud83c\uddea\ud83c\udde8',
  NED: '\ud83c\uddf3\ud83c\uddf1', JPN: '\ud83c\uddef\ud83c\uddf5', SWE: '\ud83c\uddf8\ud83c\uddea', TUN: '\ud83c\uddf9\ud83c\uddf3', BEL: '\ud83c\udde7\ud83c\uddea',
  EGY: '\ud83c\uddea\ud83c\uddec', IRN: '\ud83c\uddee\ud83c\uddf7', NZL: '\ud83c\uddf3\ud83c\uddff', ESP: '\ud83c\uddea\ud83c\uddf8', CPV: '\ud83c\udde8\ud83c\uddfb',
  KSA: '\ud83c\uddf8\ud83c\udde6', URU: '\ud83c\uddfa\ud83c\uddfe', FRA: '\ud83c\uddeb\ud83c\uddf7', SEN: '\ud83c\uddf8\ud83c\uddf3', IRQ: '\ud83c\uddee\ud83c\uddf6',
  NOR: '\ud83c\uddf3\ud83c\uddf4', ARG: '\ud83c\udde6\ud83c\uddf7', ALG: '\ud83c\udde9\ud83c\uddff', AUT: '\ud83c\udde6\ud83c\uddf9', JOR: '\ud83c\uddef\ud83c\uddf4',
  POR: '\ud83c\uddf5\ud83c\uddf9', COD: '\ud83c\udde8\ud83c\udde9', UZB: '\ud83c\uddfa\ud83c\uddff', COL: '\ud83c\udde8\ud83c\uddf4', ENG: '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',
  CRO: '\ud83c\udded\ud83c\uddf7', GHA: '\ud83c\uddec\ud83c\udded', PAN: '\ud83c\uddf5\ud83c\udde6'
};

const createCountryStickers = (teamId: string, startNum: number): Sticker[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `${teamId}-${startNum + i}`,
    number: startNum + i,
    teamId,
  }));
};

const createSpecialsStickers = (): Sticker[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `SPC-${i}`,
    number: i,
    teamId: 'SPC',
  }));
};

export const specialsTeam: Team = {
  id: 'SPC',
  code: 'SPC',
  name: 'Specials',
  flag: '\u2b50',
  color: '#FFD700',
  stickers: createSpecialsStickers(),
};

export const countryTeams: Team[] = COUNTRY_ORDER.map((code, index) => {
  const startNum = 20 + index * 20 + 1;
  return {
    id: code,
    code,
    name: COUNTRY_NAMES[code] || code,
    flag: COUNTRY_FLAGS[code] || '\ud83c\udf0d',
    color: COUNTRY_COLORS[code] || '#666666',
    stickers: createCountryStickers(code, startNum),
  };
});

export const allTeams: Team[] = [specialsTeam, ...countryTeams];

export const getTeamById = (id: string): Team | undefined => allTeams.find(t => t.id === id);

export const getStickerById = (id: string): { sticker: Sticker; team: Team } | undefined => {
  for (const team of allTeams) {
    const sticker = team.stickers.find(s => s.id === id);
    if (sticker) return { sticker, team };
  }
  return undefined;
};

export const getTotalStickersCount = (): number => allTeams.reduce((sum, t) => sum + t.stickers.length, 0);

export const getTeamCodeFromText = (text: string): string | null => {
  const upper = text.toUpperCase().trim();
  if (upper === 'SPC' || upper.includes('SPECIAL')) return 'SPC';
  for (const code of COUNTRY_ORDER) {
    if (upper.includes(code)) return code;
  }
  return null;
};

export const parseStickerNumber = (text: string): number | null => {
  const match = text.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return isNaN(num) ? null : num;
  }
  return null;
};
