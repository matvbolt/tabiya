import type { Lang } from "../i18n";

export type Player = {
  name: string;
  nameRu: string;
  flag: string;
  rating: number;
  photo?: string;
  note?: Record<Lang, string>;
};

export const PLAYERS: Player[] = [
  { name: "Magnus Carlsen", nameRu: "Магнус Карлсен", flag: "🇳🇴", rating: 2837, photo: "/players/carlsen.jpg", note: { en: "World #1 · 5× World Champion", ru: "№1 мира · 5× чемпион мира" } },
  { name: "Hikaru Nakamura", nameRu: "Хикару Накамура", flag: "🇺🇸", rating: 2807, photo: "/players/nakamura.jpg", note: { en: "Speed-chess king", ru: "Король быстрых шахмат" } },
  { name: "Fabiano Caruana", nameRu: "Фабиано Каруана", flag: "🇺🇸", rating: 2797, photo: "/players/caruana.jpg", note: { en: "2018 title challenger", ru: "Претендент на титул 2018" } },
  { name: "Gukesh Dommaraju", nameRu: "Гукеш Доммараджу", flag: "🇮🇳", rating: 2787, photo: "/players/gukesh.jpg", note: { en: "World Champion 2024", ru: "Чемпион мира 2024" } },
  { name: "Arjun Erigaisi", nameRu: "Арджун Эригайси", flag: "🇮🇳", rating: 2782, photo: "/players/erigaisi.jpg", note: { en: "India's rising star", ru: "Восходящая звезда Индии" } },
  { name: "Nodirbek Abdusattorov", nameRu: "Нодирбек Абдусатторов", flag: "🇺🇿", rating: 2766, photo: "/players/abdusattorov.jpg", note: { en: "Uzbek prodigy", ru: "Узбекский вундеркинд" } },
  { name: "Alireza Firouzja", nameRu: "Алиреза Фируджа", flag: "🇫🇷", rating: 2766, photo: "/players/firouzja.jpg", note: { en: "Youngest to 2800", ru: "Самый юный 2800" } },
  { name: "R Praggnanandhaa", nameRu: "Прагнанандха", flag: "🇮🇳", rating: 2758, photo: "/players/prag.jpg", note: { en: "World Cup finalist 2023", ru: "Финалист Кубка мира 2023" } },
  { name: "Ian Nepomniachtchi", nameRu: "Ян Непомнящий", flag: "🇷🇺", rating: 2758, photo: "/players/nepo.jpg", note: { en: "2× title challenger", ru: "2× претендент на титул" } },
  { name: "Wei Yi", nameRu: "Вэй И", flag: "🇨🇳", rating: 2755 },
  { name: "Anish Giri", nameRu: "Аниш Гири", flag: "🇳🇱", rating: 2749 },
  { name: "Wesley So", nameRu: "Уэсли Со", flag: "🇺🇸", rating: 2745 },
  { name: "Vidit Gujrathi", nameRu: "Видит Гуджратхи", flag: "🇮🇳", rating: 2742 },
  { name: "Le Quang Liem", nameRu: "Ле Куанг Льем", flag: "🇻🇳", rating: 2741 },
  { name: "Leinier Domínguez", nameRu: "Лейнер Домингес", flag: "🇺🇸", rating: 2739 },
  { name: "Maxime Vachier-Lagrave", nameRu: "Максим Вашье-Лаграв", flag: "🇫🇷", rating: 2737 },
  { name: "Levon Aronian", nameRu: "Левон Аронян", flag: "🇺🇸", rating: 2736 },
  { name: "Yu Yangyi", nameRu: "Юй Янъи", flag: "🇨🇳", rating: 2734 },
  { name: "Vincent Keymer", nameRu: "Винсент Кеймер", flag: "🇩🇪", rating: 2733 },
  { name: "Parham Maghsoodloo", nameRu: "Пархам Магсудлу", flag: "🇮🇷", rating: 2732 },
  { name: "Jan-Krzysztof Duda", nameRu: "Ян-Кшиштоф Дуда", flag: "🇵🇱", rating: 2731 },
  { name: "Richárd Rapport", nameRu: "Рихард Раппорт", flag: "🇭🇺", rating: 2730 },
  { name: "Shakhriyar Mamedyarov", nameRu: "Шахрияр Мамедьяров", flag: "🇦🇿", rating: 2729 },
  { name: "Ding Liren", nameRu: "Дин Лижэнь", flag: "🇨🇳", rating: 2728, photo: "/players/ding.jpg", note: { en: "World Champion 2023", ru: "Чемпион мира 2023" } },
  { name: "Javokhir Sindarov", nameRu: "Джавохир Синдаров", flag: "🇺🇿", rating: 2726, note: { en: "2026 title challenger", ru: "Претендент на титул 2026" } },
  { name: "Teimour Radjabov", nameRu: "Теймур Раджабов", flag: "🇦🇿", rating: 2725 },
  { name: "Nihal Sarin", nameRu: "Нихал Сарин", flag: "🇮🇳", rating: 2723 },
  { name: "Vladimir Fedoseev", nameRu: "Владимир Федосеев", flag: "🇸🇮", rating: 2720 },
  { name: "Daniil Dubov", nameRu: "Даниил Дубов", flag: "🇷🇺", rating: 2716 },
  { name: "Sam Shankland", nameRu: "Сэм Шенкленд", flag: "🇺🇸", rating: 2712 },
];

export type ChessEvent = {
  name: string;
  nameRu: string;
  date: Record<Lang, string>;
  blurb: Record<Lang, string>;
  more: Record<Lang, string>;
};

export const EVENTS: ChessEvent[] = [
  {
    name: "44th Chess Olympiad",
    nameRu: "44-я Шахматная олимпиада",
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
    nameRu: "Матч за звание чемпиона мира 2026",
    date: { en: "23 Nov – 17 Dec 2026 · host TBD", ru: "23 ноя – 17 дек 2026 · место уточняется" },
    blurb: {
      en: "Gukesh Dommaraju defends the classical title against Javokhir Sindarov.",
      ru: "Гукеш Доммараджу защищает классический титул против Джавохира Синдарова.",
    },
    more: {
      en: "Sindarov won the 2026 Candidates Tournament in Cyprus to earn the challenge. Dates are provisional and the host city is still to be announced.",
      ru: "Синдаров выиграл турнир претендентов 2026 на Кипре и получил право на матч. Даты предварительные, город ещё не объявлен.",
    },
  },
  {
    name: "Women's World Championship 2026",
    nameRu: "Женский чемпионат мира 2026",
    date: { en: "2026 · dates & host TBD", ru: "2026 · даты и место уточняются" },
    blurb: {
      en: "Reigning champion Ju Wenjun faces Candidates winner Vaishali Rameshbabu.",
      ru: "Действующая чемпионка Цзюй Вэньцзюнь против победительницы претенденток Вайшали Рамешбабу.",
    },
    more: {
      en: "Vaishali qualified by winning the Women's Candidates Tournament 2026.",
      ru: "Вайшали отобралась, выиграв турнир претенденток 2026.",
    },
  },
  {
    name: "Grand Chess Tour 2026–27",
    nameRu: "Гранд-Чесс-Тур 2026–27",
    date: { en: "First leg · autumn 2026", ru: "Первый этап · осень 2026" },
    blurb: {
      en: "The elite annual circuit of classical, rapid and blitz super-tournaments.",
      ru: "Элитная годовая серия классических, рапид- и блиц-супертурниров.",
    },
    more: {
      en: "The opening event is planned for autumn 2026, with the full season running through 2027.",
      ru: "Открывающий этап запланирован на осень 2026, полный сезон — в течение 2027 года.",
    },
  },
  {
    name: "Tata Steel Chess 2027",
    nameRu: "Tata Steel Chess 2027",
    date: { en: "January 2027 · Wijk aan Zee 🇳🇱", ru: "Январь 2027 · Вейк-ан-Зее 🇳🇱" },
    blurb: {
      en: "The 'Wimbledon of chess' — the traditional season-opening super-tournament.",
      ru: "«Уимблдон шахмат» — традиционный супертурнир, открывающий сезон.",
    },
    more: {
      en: "Held every January in the Netherlands since 1938, it gathers the world elite alongside a huge amateur festival.",
      ru: "Проводится каждый январь в Нидерландах с 1938 года, собирает мировую элиту и большой любительский фестиваль.",
    },
  },
];
