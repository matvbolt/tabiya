import type { Lang } from "../i18n";

export type Player = {
  name: string;
  photo: string;
  flag: string;
  rating: number;
  note: Record<Lang, string>;
};

export const PLAYERS: Player[] = [
  {
    name: "Magnus Carlsen",
    photo: "/players/carlsen.jpg",
    flag: "🇳🇴",
    rating: 2837,
    note: { en: "World #1 · 5× World Champion", ru: "№1 мира · 5× чемпион мира" },
  },
  {
    name: "Hikaru Nakamura",
    photo: "/players/nakamura.jpg",
    flag: "🇺🇸",
    rating: 2807,
    note: { en: "Speed-chess king", ru: "Король быстрых шахмат" },
  },
  {
    name: "Fabiano Caruana",
    photo: "/players/caruana.jpg",
    flag: "🇺🇸",
    rating: 2795,
    note: { en: "2018 title challenger", ru: "Претендент на титул 2018" },
  },
  {
    name: "Gukesh Dommaraju",
    photo: "/players/gukesh.jpg",
    flag: "🇮🇳",
    rating: 2783,
    note: { en: "World Champion 2024", ru: "Чемпион мира 2024" },
  },
  {
    name: "Arjun Erigaisi",
    photo: "/players/erigaisi.jpg",
    flag: "🇮🇳",
    rating: 2782,
    note: { en: "India's rising star", ru: "Восходящая звезда Индии" },
  },
  {
    name: "Alireza Firouzja",
    photo: "/players/firouzja.jpg",
    flag: "🇫🇷",
    rating: 2766,
    note: { en: "Youngest to 2800", ru: "Самый юный 2800" },
  },
  {
    name: "Nodirbek Abdusattorov",
    photo: "/players/abdusattorov.jpg",
    flag: "🇺🇿",
    rating: 2766,
    note: { en: "Uzbek prodigy", ru: "Узбекский вундеркинд" },
  },
  {
    name: "Ian Nepomniachtchi",
    photo: "/players/nepo.jpg",
    flag: "🇷🇺",
    rating: 2758,
    note: { en: "2× title challenger", ru: "2× претендент на титул" },
  },
  {
    name: "R Praggnanandhaa",
    photo: "/players/prag.jpg",
    flag: "🇮🇳",
    rating: 2758,
    note: { en: "World Cup finalist 2023", ru: "Финалист Кубка мира 2023" },
  },
  {
    name: "Ding Liren",
    photo: "/players/ding.jpg",
    flag: "🇨🇳",
    rating: 2728,
    note: { en: "World Champion 2023", ru: "Чемпион мира 2023" },
  },
];

export type ChessEvent = {
  name: string;
  date: Record<Lang, string>;
  blurb: Record<Lang, string>;
  more: Record<Lang, string>;
};

export const EVENTS: ChessEvent[] = [
  {
    name: "44th Chess Olympiad",
    date: { en: "15–27 Sep 2026 · Samarkand 🇺🇿", ru: "15–27 сен 2026 · Самарканд 🇺🇿" },
    blurb: {
      en: "National teams from ~190 countries — the biggest team event in chess.",
      ru: "Сборные ~190 стран — крупнейшее командное событие в шахматах.",
    },
    more: {
      en: "Held in Samarkand, Uzbekistan. Open and Women's sections run in parallel over 11 rounds of team play.",
      ru: "Пройдёт в Самарканде, Узбекистан. Открытый и женский турниры идут параллельно, 11 туров командной игры.",
    },
  },
  {
    name: "World Chess Championship 2026",
    date: { en: "23 Nov – 17 Dec 2026 · host TBD", ru: "23 ноя – 17 дек 2026 · место уточняется" },
    blurb: {
      en: "Gukesh Dommaraju defends the classical title against Javokhir Sindarov.",
      ru: "Гукеш Доммараджу защищает классический титул против Джавохира Синдарова.",
    },
    more: {
      en: "Sindarov won the 2026 Candidates Tournament in Cyprus to earn the challenge. The match dates are provisional and the host city is still to be announced.",
      ru: "Синдаров выиграл турнир претендентов 2026 на Кипре и получил право на матч. Даты предварительные, город-организатор ещё не объявлен.",
    },
  },
  {
    name: "Women's World Championship 2026",
    date: { en: "2026 · dates & host TBD", ru: "2026 · даты и место уточняются" },
    blurb: {
      en: "Reigning champion Ju Wenjun faces Candidates winner Vaishali Rameshbabu.",
      ru: "Действующая чемпионка Цзюй Вэньцзюнь против победительницы претенденток Вайшали Рамешбабу.",
    },
    more: {
      en: "Vaishali qualified by winning the Women's Candidates Tournament 2026. FIDE has yet to confirm the schedule and venue.",
      ru: "Вайшали отобралась, выиграв турнир претенденток 2026. ФИДЕ ещё не подтвердила расписание и место.",
    },
  },
  {
    name: "Grand Chess Tour 2026–27",
    date: { en: "First leg · autumn 2026", ru: "Первый этап · осень 2026" },
    blurb: {
      en: "The elite annual circuit of classical, rapid and blitz super-tournaments.",
      ru: "Элитная годовая серия классических, рапид- и блиц-супертурниров.",
    },
    more: {
      en: "The opening event is planned for autumn 2026, with the full season running through 2027 across several countries.",
      ru: "Открывающий этап запланирован на осень 2026, полный сезон — в течение 2027 года в нескольких странах.",
    },
  },
  {
    name: "Tata Steel Chess 2027",
    date: { en: "January 2027 · Wijk aan Zee 🇳🇱", ru: "Январь 2027 · Вейк-ан-Зее 🇳🇱" },
    blurb: {
      en: "The 'Wimbledon of chess' — the traditional season-opening super-tournament.",
      ru: "«Уимблдон шахмат» — традиционный супертурнир, открывающий сезон.",
    },
    more: {
      en: "Held every January in the Netherlands since 1938, it gathers the world elite alongside a huge amateur festival.",
      ru: "Проводится каждый январь в Нидерландах с 1938 года, собирает мировую элиту и огромный любительский фестиваль.",
    },
  },
];
