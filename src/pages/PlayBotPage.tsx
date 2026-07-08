import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { Arrow } from "react-chessboard";
import GameBoard from "../game/GameBoard";
import CapturedTray from "../game/CapturedTray";
import { capturedFromFen } from "../game/material";
import { checkHighlight } from "../game/checkHighlight";
import Clock from "../game/Clock";
import { StockfishEngine } from "../engine/stockfish";
import { OPENINGS } from "../openings/data";
import { buildBook, fenKey } from "../openings/book";
import { playMoveSound, playSound } from "../game/sounds";
import { describeUci, formatEval } from "../game/explain";
import {
  classify,
  cpFromInfo,
  QUALITY_SYMBOL,
  type Quality,
} from "../game/moveQuality";
import { useDialog } from "../ui/DialogProvider";
import { useI18n } from "../i18n";
import { useAuth } from "../auth/AuthContext";
import { awardCoins } from "../lib/coins";
import { OPENING_THEORY, openingName } from "../content/theory";

const DIFFICULTIES = [
  { id: "easy", key: "level.easy", elo: 1350 },
  { id: "medium", key: "level.medium", elo: 1650 },
  { id: "good", key: "level.strong", elo: 1950 },
  { id: "hard", key: "level.hard", elo: 2300 },
] as const;

const TIME_CONTROLS = [
  { id: "off", labelKey: "tc.off", base: 0, inc: 0 },
  { id: "1+0", label: "1+0", base: 60, inc: 0 },
  { id: "3+2", label: "3+2", base: 180, inc: 2 },
  { id: "5+0", label: "5+0", base: 300, inc: 0 },
  { id: "10+0", label: "10+0", base: 600, inc: 0 },
] as const;

const BOOK_ARROW_COLOR = "#2e9e4f";
const ENGINE_ARROW_COLOR = "#3b82f6";

type HintState =
  | { kind: "none" }
  | { kind: "book"; san: string; from: string; to: string; reason: string }
  | {
      kind: "engine";
      from: string;
      to: string;
      san: string;
      reason: string;
      evalText: string | null;
    }
  | { kind: "loading" };

const PlayBotPage = () => {
  const dialog = useDialog();
  const { t, lang } = useI18n();
  const { user, refreshProfile } = useAuth();
  const awardedRef = useRef(false);
  const [openingId, setOpeningId] = useState(OPENINGS[0].id);
  const [elo, setElo] = useState<number>(DIFFICULTIES[2].elo);
  const [showHints, setShowHints] = useState(true);
  const [tcId, setTcId] = useState<string>("5+0");
  const tc = TIME_CONTROLS.find((t) => t.id === tcId)!;
  const [whiteMs, setWhiteMs] = useState(tc.base * 1000);
  const [blackMs, setBlackMs] = useState(tc.base * 1000);
  const [flagged, setFlagged] = useState<"white" | "black" | null>(null);
  const flaggedRef = useRef<"white" | "black" | null>(null);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);

  const opening = useMemo(
    () => OPENINGS.find((o) => o.id === openingId)!,
    [openingId]
  );
  const book = useMemo(() => buildBook(opening), [opening]);

  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<HintState>({ kind: "none" });
  const [history, setHistory] = useState<string[]>([]);
  const [quality, setQuality] = useState<
    { san: string; q: Quality } | "loading" | null
  >(null);

  const engineRef = useRef<StockfishEngine | null>(null);
  if (!engineRef.current) engineRef.current = new StockfishEngine();

  const youAreWhite = opening.you === "white";

  const syncFromGame = useCallback(() => {
    setFen(gameRef.current.fen());
    setHistory(gameRef.current.history());
  }, []);

  const maybeAward = useCallback(() => {
    const game = gameRef.current;
    if (!game.isGameOver() || awardedRef.current || !user) return;
    awardedRef.current = true;
    const amount = game.isCheckmate()
      ? (game.turn() === "w") === youAreWhite
        ? 2
        : 8
      : 4;
    void awardCoins(user.id, amount).then(refreshProfile);
  }, [user, youAreWhite, refreshProfile]);

  const evaluateMove = useCallback(
    async (fenBefore: string, fenAfter: string, uci: string, san: string) => {
      const bm = book.get(fenKey(fenBefore));
      if (bm && bm.san === san) {
        setQuality({ san, q: "book" });
        return;
      }
      setQuality("loading");
      const eng = engineRef.current!;
      const before = await eng.bestMoveHint(fenBefore, 12);
      const after = await eng.bestMoveHint(fenAfter, 12);
      const loss = Math.max(
        0,
        cpFromInfo(before.info) + cpFromInfo(after.info)
      );
      setQuality({ san, q: classify(loss, before.bestMove === uci) });
    },
    [book]
  );

  const addInc = useCallback(
    (color: "w" | "b") => {
      if (tc.inc <= 0) return;
      const bump = tc.inc * 1000;
      if (color === "w") setWhiteMs((m) => m + bump);
      else setBlackMs((m) => m + bump);
    },
    [tc.inc]
  );

  useEffect(() => {
    setWhiteMs(tc.base * 1000);
    setBlackMs(tc.base * 1000);
    setFlagged(null);
    flaggedRef.current = null;
  }, [tcId, opening.id]);

  useEffect(() => {
    if (tc.base === 0) return;
    let last = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const dt = now - last;
      last = now;
      if (!startedRef.current || flaggedRef.current || gameRef.current.isGameOver())
        return;
      const turn = gameRef.current.turn();
      const dec = (m: number) => Math.max(0, m - dt);
      if (turn === "w")
        setWhiteMs((m) => {
          const n = dec(m);
          if (n <= 0 && !flaggedRef.current) {
            flaggedRef.current = "white";
            setFlagged("white");
          }
          return n;
        });
      else
        setBlackMs((m) => {
          const n = dec(m);
          if (n <= 0 && !flaggedRef.current) {
            flaggedRef.current = "black";
            setFlagged("black");
          }
          return n;
        });
    }, 100);
    return () => clearInterval(id);
  }, [tcId]);

  const playBotMove = useCallback(async () => {
    const engine = engineRef.current!;
    const game = gameRef.current;
    if (!startedRef.current || game.isGameOver() || flaggedRef.current) return;

    setThinking(true);
    const { bestMove } = await engine.bestMoveForBot(game.fen(), elo);
    setThinking(false);

    if (!bestMove || flaggedRef.current) return;
    const from = bestMove.slice(0, 2);
    const to = bestMove.slice(2, 4);
    const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
    let move;
    try {
      move = game.move({ from, to, promotion });
    } catch {
      return;
    }
    syncFromGame();
    addInc(youAreWhite ? "b" : "w");
    playMoveSound(move, { inCheck: game.isCheck(), gameOver: game.isGameOver() });
    maybeAward();
  }, [elo, syncFromGame, addInc, youAreWhite, maybeAward]);

  useEffect(() => {
    const game = gameRef.current;
    const isPlayersTurn =
      (game.turn() === "w") === youAreWhite && !game.isGameOver();

    if (!started || !showHints || !isPlayersTurn || thinking) {
      setHint({ kind: "none" });
      return;
    }

    const bookMove = book.get(fenKey(game.fen()));
    if (bookMove) {
      const { reason } = describeUci(
        game.fen(),
        bookMove.from,
        bookMove.to,
        bookMove.promotion,
        lang,
        ""
      );
      setHint({
        kind: "book",
        san: bookMove.san,
        from: bookMove.from,
        to: bookMove.to,
        reason,
      });
      return;
    }

    const controller = { cancelled: false };
    const fenAtRequest = game.fen();
    setHint({ kind: "loading" });
    engineRef.current!.bestMoveHint(fenAtRequest).then(({ bestMove, info }) => {
      if (controller.cancelled || gameRef.current.fen() !== fenAtRequest) return;
      if (!bestMove) return setHint({ kind: "none" });
      const from = bestMove.slice(0, 2);
      const to = bestMove.slice(2, 4);
      const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
      const { san, reason } = describeUci(
        fenAtRequest,
        from,
        to,
        promotion,
        lang,
        t("hints.engineTopFallback")
      );
      setHint({
        kind: "engine",
        from,
        to,
        san,
        reason,
        evalText: formatEval(info, lang),
      });
    });
    return () => {
      controller.cancelled = true;
    };
  }, [fen, showHints, thinking, book, youAreWhite, lang, t, started]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    []
  );

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!targetSquare) return false;
      const game = gameRef.current;
      const isPlayersTurn = (game.turn() === "w") === youAreWhite;
      if (!isPlayersTurn || thinking || game.isGameOver() || flaggedRef.current)
        return false;
      const fenBefore = game.fen();
      let move;
      try {
        move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }
      const fenAfter = game.fen();
      const uci = move.from + move.to + (move.promotion ?? "");
      syncFromGame();
      addInc(youAreWhite ? "w" : "b");
      playMoveSound(move, { inCheck: game.isCheck(), gameOver: game.isGameOver() });
      maybeAward();
      if (!showHints) void evaluateMove(fenBefore, fenAfter, uci, move.san);
      void playBotMove();
      return true;
    },
    [
      playBotMove,
      syncFromGame,
      thinking,
      youAreWhite,
      addInc,
      maybeAward,
      showHints,
      evaluateMove,
    ]
  );

  const startGame = useCallback(() => {
    gameRef.current = new Chess();
    syncFromGame();
    setThinking(false);
    setWhiteMs(tc.base * 1000);
    setBlackMs(tc.base * 1000);
    setFlagged(null);
    flaggedRef.current = null;
    awardedRef.current = false;
    setQuality(null);
    startedRef.current = true;
    setStarted(true);
    playSound("gameStart");
    if (opening.you === "black") void playBotMove();
  }, [opening.you, tc.base, syncFromGame]);

  const resetGame = useCallback(async () => {
    const inProgress =
      gameRef.current.history().length > 0 && !gameRef.current.isGameOver();
    if (inProgress) {
      const ok = await dialog.confirm({
        title: t("dlg.newGameTitle"),
        message: t("dlg.newGameMsg"),
        confirmLabel: t("bot.newGame"),
      });
      if (!ok) return;
    }
    startedRef.current = false;
    setStarted(false);
    setThinking(false);
  }, [dialog, t]);

  const arrows: Arrow[] = useMemo(() => {
    if (!showHints) return [];
    if (hint.kind === "book")
      return [
        {
          startSquare: hint.from,
          endSquare: hint.to,
          color: BOOK_ARROW_COLOR,
        },
      ];
    if (hint.kind === "engine")
      return [
        { startSquare: hint.from, endSquare: hint.to, color: ENGINE_ARROW_COLOR },
      ];
    return [];
  }, [hint, showHints]);

  const game = gameRef.current;
  const isPlayersTurn =
    (game.turn() === "w") === youAreWhite && !game.isGameOver();

  const statusText = (() => {
    if (flagged)
      return flagged === "white" ? t("status.timeBlack") : t("status.timeWhite");
    if (game.isCheckmate())
      return game.turn() === "w" ? t("status.mateBlack") : t("status.mateWhite");
    if (game.isStalemate()) return t("status.stalemate");
    if (game.isDraw()) return t("status.draw");
    if (thinking) return t("status.thinking");
    if (isPlayersTurn) return t("status.your");
    return t("status.opp");
  })();

  const meWhite = opening.you === "white";
  const oppColor = meWhite ? "black" : "white";
  const cap = capturedFromFen(fen);
  const myCaptures = meWhite ? cap.byWhite : cap.byBlack;
  const oppCaptures = meWhite ? cap.byBlack : cap.byWhite;
  const myAdv = meWhite ? cap.diff : -cap.diff;

  const clocksOn = tc.base > 0;
  const myMs = meWhite ? whiteMs : blackMs;
  const oppMs = meWhite ? blackMs : whiteMs;
  const clocksLive = clocksOn && !flagged && !game.isGameOver();

  if (!started) {
    return (
      <div className="setup-wrap">
        <section className="panel setup">
          <div className="eyebrow">// {t("bot.setup")}</div>

          <div className="field">
            <label className="field__label">{t("bot.opening")}</label>
            <select
              value={openingId}
              onChange={(e) => setOpeningId(e.target.value)}
            >
              {OPENINGS.map((o) => (
                <option key={o.id} value={o.id}>
                  {openingName(o.id, o.name, lang)} ·{" "}
                  {o.you === "white" ? t("white") : t("black")}
                </option>
              ))}
            </select>
            <p className="field__hint">
              {OPENING_THEORY[opening.id]?.desc[lang] ?? opening.description}
            </p>
          </div>

          <div className="field">
            <label className="field__label">{t("bot.level")}</label>
            <div className="segmented">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={d.elo === elo ? "is-active" : ""}
                  onClick={() => setElo(d.elo)}
                >
                  {t(d.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field__label">{t("bot.time")}</label>
            <div className="segmented segmented--tc">
              {TIME_CONTROLS.map((c) => (
                <button
                  key={c.id}
                  className={c.id === tcId ? "is-active" : ""}
                  onClick={() => setTcId(c.id)}
                >
                  {"labelKey" in c ? t(c.labelKey) : c.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary btn-big" onClick={startGame}>
            {t("bot.start")}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="layout">
      <section className="board-col">
        <div className="game-side">
          <CapturedTray
            pieces={oppCaptures}
            pieceColor={opening.you}
            advantage={myAdv < 0 ? -myAdv : undefined}
            label={t("game.opponent")}
          />
          {clocksOn && (
            <Clock ms={oppMs} active={clocksLive && !isPlayersTurn} />
          )}
        </div>
        <div className="board-wrap">
          <GameBoard
            fen={fen}
            orientation={opening.you}
            arrows={arrows}
            squareStyles={checkHighlight(game)}
            onPieceDrop={onPieceDrop}
          />
        </div>
        <div className="game-side">
          <CapturedTray
            pieces={myCaptures}
            pieceColor={oppColor}
            advantage={myAdv > 0 ? myAdv : undefined}
            label={t("game.you")}
          />
          {clocksOn && (
            <Clock ms={myMs} active={clocksLive && isPlayersTurn} />
          )}
        </div>
      </section>

      <aside className="panel">
        <div className="status" data-thinking={thinking}>
          {statusText}
        </div>

        <div className="hint-box">
          <label className="toggle">
            <input
              type="checkbox"
              checked={showHints}
              onChange={(e) => setShowHints(e.target.checked)}
            />
            {t("hints.show")}
          </label>

          {showHints && hint.kind === "book" && (
            <div className="hint hint--book">
              <div className="hint__head">
                📖 {t("hints.theory")}: <b>{hint.san}</b>
              </div>
              {hint.reason && <div className="hint__why">{hint.reason}</div>}
            </div>
          )}
          {showHints && hint.kind === "engine" && (
            <div className="hint hint--engine">
              <div className="hint__head">
                🤖 {t("hints.engine")}: <b>{hint.san}</b>
                {hint.evalText && (
                  <span className="hint__eval mono">{hint.evalText}</span>
                )}
              </div>
              <div className="hint__why">{hint.reason}</div>
            </div>
          )}
          {showHints && hint.kind === "loading" && (
            <p className="hint">{t("hints.thinking")}</p>
          )}

          {!showHints && quality === "loading" && (
            <p className="hint">{t("q.analysing")}</p>
          )}
          {!showHints && quality && quality !== "loading" && (
            <div className="quality" data-q={quality.q}>
              <span className="quality__sym">{QUALITY_SYMBOL[quality.q]}</span>
              <span className="quality__text">
                <b>{quality.san}</b> — {t(`q.${quality.q}`)}
              </span>
            </div>
          )}
        </div>

        <button className="btn-reset" onClick={resetGame}>
          {t("bot.newGame")}
        </button>

        <div className="moves">
          <div className="moves__title">{t("moves.title")}</div>
          <ol className="moves__list">
            {history.map((san, i) => (
              <li key={i}>
                {i % 2 === 0 ? `${i / 2 + 1}. ` : ""}
                {san}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

export default PlayBotPage;
