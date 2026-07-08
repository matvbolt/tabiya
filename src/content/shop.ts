import type { Lang } from "../i18n";

export type Badge = { emoji: string; price: number };

export const BADGES: Badge[] = [
  { emoji: "♞", price: 60 },
  { emoji: "🔥", price: 80 },
  { emoji: "🧠", price: 90 },
  { emoji: "⚡", price: 110 },
  { emoji: "🚀", price: 130 },
  { emoji: "👑", price: 160 },
  { emoji: "🐉", price: 190 },
  { emoji: "💎", price: 240 },
];

export type NameStyle = { id: string; label: Record<Lang, string>; price: number };

export const NAME_STYLES: NameStyle[] = [
  { id: "gold", label: { en: "Gold", ru: "Золотой" }, price: 300 },
  { id: "emerald", label: { en: "Emerald", ru: "Изумруд" }, price: 250 },
  { id: "ruby", label: { en: "Ruby", ru: "Рубин" }, price: 250 },
  { id: "aqua", label: { en: "Aqua", ru: "Аква" }, price: 250 },
  { id: "fire", label: { en: "Fire", ru: "Огонь" }, price: 400 },
  { id: "gradient", label: { en: "Gradient", ru: "Градиент" }, price: 500 },
];

export type Partner = {
  name: string;
  emoji: string;
  gradient: [string, string];
  category: Record<Lang, string>;
  discount: Record<Lang, string>;
  price: number;
  blurb: Record<Lang, string>;
};

export const PARTNERS: Partner[] = [
  {
    name: "ChessMaster Academy",
    emoji: "🎓",
    gradient: ["#6366f1", "#8b5cf6"],
    category: { en: "Courses", ru: "Курсы" },
    discount: { en: "-20% on any course", ru: "-20% на любой курс" },
    price: 400,
    blurb: {
      en: "Structured video courses from opening to endgame, taught by titled coaches.",
      ru: "Структурированные видеокурсы от дебюта до эндшпиля от титулованных тренеров.",
    },
  },
  {
    name: "Grandmaster School",
    emoji: "♚",
    gradient: ["#0ea5e9", "#6366f1"],
    category: { en: "Online school", ru: "Онлайн-школа" },
    discount: { en: "-30% on membership", ru: "-30% на подписку" },
    price: 700,
    blurb: {
      en: "Live group lessons and homework reviews with grandmaster mentors.",
      ru: "Живые групповые занятия и разбор домашних заданий с гроссмейстерами.",
    },
  },
  {
    name: "Endgame Labs",
    emoji: "🧪",
    gradient: ["#10b981", "#0ea5e9"],
    category: { en: "Training app", ru: "Приложение" },
    discount: { en: "3 months free", ru: "3 месяца бесплатно" },
    price: 500,
    blurb: {
      en: "Spaced-repetition endgame drills that actually stick in your memory.",
      ru: "Тренажёр окончаний с интервальным повторением, который реально запоминается.",
    },
  },
  {
    name: "TacticsTrainer Pro",
    emoji: "🎯",
    gradient: ["#f59e0b", "#ef4444"],
    category: { en: "Tactics", ru: "Тактика" },
    discount: { en: "-50% annual plan", ru: "-50% на год" },
    price: 350,
    blurb: {
      en: "Thousands of puzzles sorted by theme and difficulty, with rating tracking.",
      ru: "Тысячи задач по темам и сложности с отслеживанием рейтинга.",
    },
  },
  {
    name: "ChessTravel Retreats",
    emoji: "✈️",
    gradient: ["#8b5cf6", "#ec4899"],
    category: { en: "Travel", ru: "Путешествия" },
    discount: { en: "-15% on chess retreats", ru: "-15% на шахматные ретриты" },
    price: 1200,
    blurb: {
      en: "Seaside training camps that mix chess study with a proper holiday.",
      ru: "Тренировочные лагеря у моря — шахматы плюс полноценный отдых.",
    },
  },
  {
    name: "Boardwalk Chess Café",
    emoji: "☕",
    gradient: ["#f97316", "#a16207"],
    category: { en: "Venue", ru: "Заведение" },
    discount: { en: "Free entry for a month", ru: "Бесплатный вход на месяц" },
    price: 250,
    blurb: {
      en: "A cozy café with clocks on every table and weekly blitz nights.",
      ru: "Уютное кафе с часами на каждом столе и еженедельными блиц-вечерами.",
    },
  },
  {
    name: "Grand Plaza Hotels",
    emoji: "🏨",
    gradient: ["#0ea5e9", "#14b8a6"],
    category: { en: "Travel", ru: "Путешествия" },
    discount: { en: "-10% on stays", ru: "-10% на проживание" },
    price: 1500,
    blurb: {
      en: "Tournament-friendly hotels near major chess venues worldwide.",
      ru: "Отели рядом с крупными шахматными площадками по всему миру.",
    },
  },
  {
    name: "OpeningBooks Press",
    emoji: "📚",
    gradient: ["#6366f1", "#0ea5e9"],
    category: { en: "Books", ru: "Книги" },
    discount: { en: "-25% on any book", ru: "-25% на любую книгу" },
    price: 300,
    blurb: {
      en: "Modern repertoire books and classic manuals in print and digital.",
      ru: "Современные книги по дебютам и классические учебники в печати и цифре.",
    },
  },
  {
    name: "Junior Chess Camp",
    emoji: "🏕️",
    gradient: ["#22c55e", "#84cc16"],
    category: { en: "Kids", ru: "Дети" },
    discount: { en: "-20% on summer camp", ru: "-20% на летний лагерь" },
    price: 600,
    blurb: {
      en: "A week of chess, sport and friends for young players aged 7–14.",
      ru: "Неделя шахмат, спорта и друзей для игроков 7–14 лет.",
    },
  },
  {
    name: "Elite 1-on-1 Coaching",
    emoji: "🧑‍🏫",
    gradient: ["#ec4899", "#8b5cf6"],
    category: { en: "Coaching", ru: "Тренировки" },
    discount: { en: "1 free private lesson", ru: "1 бесплатное занятие" },
    price: 900,
    blurb: {
      en: "Personal lessons tailored to your games and weaknesses by a strong coach.",
      ru: "Персональные занятия под ваши партии и слабости с сильным тренером.",
    },
  },
];
