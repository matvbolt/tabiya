import type { Lang } from "../i18n";

export const PRINCIPLES: Record<Lang, string[]> = {
  en: [
    "Control the centre — put pawns on e4/d4 (or challenge your opponent's) to open lines and gain space.",
    "Develop toward the centre — knights before bishops; don't move the same piece twice without a reason.",
    "Castle early — bring your king to safety and connect the rooks.",
    "Don't bring the queen out too early — it just becomes a target for the opponent's minor pieces.",
    "Put rooks on open or half-open files where they do the most work.",
    "Every move should have a purpose: develop a piece, fight for the centre, or improve your worst-placed piece.",
  ],
  ru: [
    "Контролируй центр — ставь пешки на e4/d4 (или подрывай пешки соперника), чтобы открыть линии и захватить пространство.",
    "Развивай к центру — кони раньше слонов; не ходи одной фигурой дважды без причины.",
    "Рокируй рано — уводи короля в безопасность и связывай ладьи.",
    "Не выводи ферзя слишком рано — он станет мишенью для лёгких фигур соперника.",
    "Ставь ладьи на открытые и полуоткрытые линии, где они работают лучше всего.",
    "У каждого хода должна быть цель: развить фигуру, побороться за центр или улучшить худшую фигуру.",
  ],
};

export const OPENING_THEORY: Record<
  string,
  {
    name: Record<Lang, string>;
    desc: Record<Lang, string>;
    body: Record<Lang, string[]>;
  }
> = {
  "ruy-lopez": {
    name: { en: "Ruy Lopez (Spanish)", ru: "Испанская партия" },
    desc: {
      en: "Pressure e5 through the c6 knight. Slow, deep, positional.",
      ru: "Давление на e5 через коня c6. Медленно, глубоко, позиционно.",
    },
    body: {
      en: [
        "1.e4 e5 2.Nf3 Nc6 3.Bb5 attacks the knight defending e5. White isn't really winning a pawn (after 3...a6 4.Ba4 Nf6 5.O-O the e4 pawn is 'poisoned'), but builds lasting pressure.",
        "White's plan: c3 and d4 for a big centre, reroute the b1-knight via d2–f1–g3, and press on the kingside. Black counters with ...b5, ...d6 and breaks like ...d5 or ...c5.",
        "It's a strategic, manoeuvring battle — piece placement and patience matter more than early tactics.",
      ],
      ru: [
        "1.e4 e5 2.Kf3 Kc6 3.Cb5 нападает на коня, защищающего e5. Белые не выигрывают пешку по-настоящему (после 3...a6 4.Ca4 Kf6 5.0-0 пешка e4 «отравлена»), но получают длительное давление.",
        "План белых: c3 и d4 для большого центра, перевод коня b1 по маршруту d2–f1–g3 и игра на королевском фланге. Чёрные отвечают ...b5, ...d6 и подрывами ...d5 или ...c5.",
        "Это стратегическая, манёвренная борьба — расположение фигур и терпение важнее ранней тактики.",
      ],
    },
  },
  italian: {
    name: { en: "Italian Game", ru: "Итальянская партия" },
    desc: {
      en: "Bishop to c4, aiming at the soft f7 square. Fast, attacking.",
      ru: "Слон на c4, прицел на слабый пункт f7. Быстро, атакующе.",
    },
    body: {
      en: [
        "1.e4 e5 2.Nf3 Nc6 3.Bc4 develops with tempo and eyes f7 — the weakest point in Black's camp before castling.",
        "The modern 'slow' Italian with c3 and d3 keeps the centre solid, then White expands with a well-timed d4 or a kingside push (Nbd2–f1–g3, h3, g4).",
        "Clear plans and quick development make it a great practical opening — you often reach an attacking middlegame with a safe king.",
      ],
      ru: [
        "1.e4 e5 2.Kf3 Kc6 3.Cc4 развивает фигуру с темпом и целится в f7 — слабейший пункт у чёрных до рокировки.",
        "Современная «медленная» итальянка с c3 и d3 держит центр крепким, затем белые расширяются своевременным d4 или наступлением на королевском фланге (Kbd2–f1–g3, h3, g4).",
        "Ясные планы и быстрое развитие делают дебют отличным на практике — часто получаешь атакующий миттельшпиль с безопасным королём.",
      ],
    },
  },
  london: {
    name: { en: "London System", ru: "Лондонская система" },
    desc: {
      en: "Bishop to f4, the same solid setup against almost anything.",
      ru: "Слон на f4 — одна надёжная схема почти против всего.",
    },
    body: {
      en: [
        "The London System is a setup, not a memorised line: d4, Bf4, e3, Nf3, c3, Nbd2, Bd3 — played in almost any move order.",
        "The point is a rock-solid structure with an active dark-squared bishop outside the pawn chain. White often follows with Ne5, f4 and a kingside build-up.",
        "It's ideal when you want reliable positions without heavy theory — you get the same plans against most Black defences.",
      ],
      ru: [
        "Лондонская система — это схема, а не заученный вариант: d4, Cf4, e3, Kf3, c3, Kbd2, Cd3 — почти в любом порядке ходов.",
        "Смысл — очень прочная структура с активным чернопольным слоном вне пешечной цепи. Часто белые продолжают Ke5, f4 и наступлением на короля.",
        "Идеально, когда нужны надёжные позиции без тяжёлой теории — против большинства защит чёрных планы одни и те же.",
      ],
    },
  },
  "sicilian-najdorf": {
    name: {
      en: "Sicilian Defence (Najdorf)",
      ru: "Сицилианская защита (Найдорф)",
    },
    desc: {
      en: "Sharp, ambitious counterattack against 1.e4.",
      ru: "Острая, амбициозная контратака против 1.e4.",
    },
    body: {
      en: [
        "1.e4 c5 fights for the centre asymmetrically. After 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6, the Najdorf's ...a6 stops Nb5 and prepares ...e5 and queenside expansion with ...b5.",
        "Black accepts a slightly loose position in return for dynamic piece play and a half-open c-file for counterplay against White's centre.",
        "It's double-edged and theory-heavy at the top level, but the core ideas — quick development, ...e5 or ...e6 setups, and pressure on c-file — are very playable.",
      ],
      ru: [
        "1.e4 c5 борется за центр асимметрично. После 2.Kf3 d6 3.d4 cxd4 4.K:d4 Kf6 5.Kc3 a6 ход ...a6 (Найдорф) не пускает Kb5 и готовит ...e5 и наступление ...b5 на ферзевом фланге.",
        "Чёрные соглашаются на чуть «рыхлую» позицию ради динамичной игры фигур и полуоткрытой линии «c» для контригры против центра белых.",
        "Дебют обоюдоострый и теоретичный на высшем уровне, но базовые идеи — быстрое развитие, схемы с ...e5/...e6 и давление по линии «c» — вполне играбельны.",
      ],
    },
  },
  "caro-kann": {
    name: { en: "Caro-Kann Defence", ru: "Защита Каро-Канн" },
    desc: {
      en: "Rock-solid reply to 1.e4 with no pawn weaknesses.",
      ru: "Прочный ответ на 1.e4 без пешечных слабостей.",
    },
    body: {
      en: [
        "1.e4 c6 prepares ...d5 to challenge the centre — but unlike the French, the light-squared bishop gets developed outside the pawn chain to f5 or g4 first.",
        "After 2.d4 d5, Black is solid in every main line (Classical 3.Nc3 dxe4, Advance 3.e5 Bf5). The structure has no weaknesses and a sound endgame.",
        "Choose it when you want a dependable, low-risk defence that still keeps winning chances in the endgame.",
      ],
      ru: [
        "1.e4 c6 готовит ...d5 для удара по центру — но в отличие от французской, белопольный слон сначала выходит из пешечной цепи на f5 или g4.",
        "После 2.d4 d5 у чёрных всё прочно в любом главном варианте (классика 3.Kc3 dxe4, наступление 3.e5 Cf5). Структура без слабостей и с надёжным эндшпилем.",
        "Выбирай, когда нужна надёжная защита с малым риском, сохраняющая шансы на победу в окончании.",
      ],
    },
  },
  "queens-gambit": {
    name: { en: "Queen's Gambit", ru: "Ферзевый гамбит" },
    desc: {
      en: "Classic 1.d4 fight for the centre with clear plans.",
      ru: "Классическая борьба за центр на 1.d4 с ясными планами.",
    },
    body: {
      en: [
        "1.d4 d5 2.c4 challenges d5. It's not a real gambit: after 2...dxc4 White easily regains the pawn with a strong centre, so Black usually declines with 2...e6 or 2...c6 (Slav).",
        "White's plan is classic central control, quick development (Nc3, Nf3, Bg5), and pressure down the c-file. The 'minority attack' with b4–b5 is a typical long-term idea.",
        "It's the backbone of classical chess — great for learning central strategy, piece coordination, and pawn structures.",
      ],
      ru: [
        "1.d4 d5 2.c4 атакует d5. Это не настоящий гамбит: после 2...dxc4 белые легко отыгрывают пешку с сильным центром, поэтому чёрные обычно отклоняют — 2...e6 или 2...c6 (славянская).",
        "План белых — классический контроль центра, быстрое развитие (Kc3, Kf3, Cg5) и давление по линии «c». Типичная долгосрочная идея — «атака меньшинства» b4–b5.",
        "Это фундамент классических шахмат — отлично для изучения стратегии центра, координации фигур и пешечных структур.",
      ],
    },
  },
};

export const openingName = (id: string, fallback: string, lang: Lang) => {
  return OPENING_THEORY[id]?.name[lang] ?? fallback;
}
