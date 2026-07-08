import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import type { Arrow } from "react-chessboard";
import GameBoard from "../game/GameBoard";
import CapturedTray from "../game/CapturedTray";
import { capturedFromFen } from "../game/material";
import { checkHighlight, kingRed } from "../game/checkHighlight";
import { useAuth } from "../auth/AuthContext";
import { useDialog } from "../ui/DialogProvider";
import { useI18n } from "../i18n";
import { openingName } from "../content/theory";
import { notifyLobby } from "../lib/realtime";
import { supabase } from "../lib/supabase";
import type { GameRow } from "../lib/games";
import { OPENINGS } from "../openings/data";
import { buildBook, fenKey } from "../openings/book";
import { StockfishEngine } from "../engine/stockfish";
import { playMoveSound, playSound } from "../game/sounds";
import { explainMove, describeUci, formatEval } from "../game/explain";

const BOOK_ARROW_COLOR = "#2e9e4f";
const ENGINE_ARROW_COLOR = "#3b82f6";

const applyUci = (game: Chess, uci: string) => {
  return game.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  });
}

const OnlineGamePage = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dialog = useDialog();
  const { t, lang } = useI18n();

  const gameRef = useRef(new Chess());
  const [row, setRow] = useState<GameRow | null>(null);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(true);
  const [engineHint, setEngineHint] = useState<{
    from: string;
    to: string;
    san: string;
    reason: string;
    evalText: string | null;
  } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const engineRef = useRef<StockfishEngine | null>(null);

  const myColor: "white" | "black" | null = !row
    ? null
    : row.white_id === user?.id
      ? "white"
      : row.black_id === user?.id
        ? "black"
        : null;

  const opening = useMemo(
    () => OPENINGS.find((o) => o.id === row?.opening_id) ?? null,
    [row?.opening_id]
  );
  const book = useMemo(
    () => (opening ? buildBook(opening) : null),
    [opening]
  );

  const sync = useCallback(() => {
    setFen(gameRef.current.fen());
    setHistory(gameRef.current.history());
    setEngineHint(null);
  }, []);

  const replay = useCallback(async () => {
    if (!gameId) return;
    const { data } = await supabase
      .from("game_moves")
      .select("uci, ply")
      .eq("game_id", gameId)
      .order("ply", { ascending: true });
    const fresh = new Chess();
    for (const m of (data as { uci: string }[]) ?? []) {
      try {
        applyUci(fresh, m.uci);
      } catch {
        break;
      }
    }
    gameRef.current = fresh;
    sync();
  }, [gameId, sync]);

  useEffect(() => {
    if (!gameId) return;
    let alive = true;

    (async () => {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
      if (alive) setRow(data as GameRow);
      await replay();
    })();

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_moves",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const m = payload.new as { uci: string; ply: number };
          if (m.ply <= gameRef.current.history().length) return;
          try {
            const mv = applyUci(gameRef.current, m.uci);
            sync();
            playMoveSound(mv, {
              inCheck: gameRef.current.isCheck(),
              gameOver: gameRef.current.isGameOver(),
            });
          } catch {
            void replay();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const next = payload.new as GameRow;
          setRow((prev) => {
            if (
              next.status === "finished" &&
              prev?.status !== "finished" &&
              (next.winner === "white" || next.winner === "black") &&
              !gameRef.current.isCheckmate()
            )
              playSound("resign");
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [gameId, replay, sync]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    []
  );

  const bothSeated = Boolean(row?.white_id && row?.black_id);
  const game = gameRef.current;
  const isMyTurn =
    !!myColor &&
    bothSeated &&
    row?.status === "active" &&
    (game.turn() === "w") === (myColor === "white") &&
    !game.isGameOver();

  const persistMove = async (uci: string, san: string) => {
    if (!gameId || !user) return;
    const ply = gameRef.current.history().length;
    const newFen = gameRef.current.fen();
    const nextTurn = gameRef.current.turn() === "w" ? "white" : "black";

    await supabase.from("game_moves").insert({
      game_id: gameId,
      ply,
      uci,
      san,
      fen: newFen,
      by_id: user.id,
    });
    await supabase
      .from("games")
      .update({
        fen: newFen,
        turn: nextTurn,
        pgn: gameRef.current.pgn(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    if (gameRef.current.isGameOver()) {
      let winner: "white" | "black" | "draw" = "draw";
      if (gameRef.current.isCheckmate())
        winner = gameRef.current.turn() === "w" ? "black" : "white";
      await supabase.rpc("finish_game", {
        p_game_id: gameId,
        p_winner: winner,
      });
    }
  }

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!targetSquare || !isMyTurn) return false;
      let move;
      try {
        move = gameRef.current.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
      } catch {
        return false;
      }
      sync();
      playMoveSound(move, {
        inCheck: gameRef.current.isCheck(),
        gameOver: gameRef.current.isGameOver(),
      });
      const uci = move.from + move.to + (move.promotion ?? "");
      void persistMove(uci, move.san);
      return true;
    },
    [isMyTurn]
  );

  const resign = async () => {
    if (!gameId || !myColor || row?.status !== "active") return;
    const ok = await dialog.confirm({
      title: t("dlg.resignTitle"),
      message: t("dlg.resignMsg"),
      confirmLabel: t("dlg.resign"),
      danger: true,
    });
    if (!ok) return;
    const winner = myColor === "white" ? "black" : "white";
    await supabase.rpc("finish_game", { p_game_id: gameId, p_winner: winner });
    navigate("/lobby");
  }

  const abortGame = async () => {
    if (!gameId) return;
    const ok = await dialog.confirm({
      title: t("dlg.cancelTitle"),
      message: t("dlg.cancelMsg"),
      confirmLabel: t("online.cancel"),
      cancelLabel: t("dlg.keepWaiting"),
      danger: true,
    });
    if (!ok) return;
    await supabase
      .from("games")
      .update({ status: "aborted", updated_at: new Date().toISOString() })
      .eq("id", gameId);
    notifyLobby();
    navigate("/lobby");
  }

  const isTraining = row?.mode === "training";

  const bookMove = useMemo(() => {
    if (!isTraining || !showHints || !isMyTurn || !book) return null;
    return book.get(fenKey(fen)) ?? null;
  }, [isTraining, showHints, isMyTurn, book, fen]);

  const bookReason = useMemo(() => {
    if (!bookMove) return "";
    try {
      return explainMove(
        new Chess(fen).move({
          from: bookMove.from,
          to: bookMove.to,
          promotion: bookMove.promotion,
        }),
        lang
      );
    } catch {
      return "";
    }
  }, [bookMove, fen, lang]);

  useEffect(() => {
    if (!isTraining || !showHints || !isMyTurn || bookMove) {
      setEngineHint(null);
      setHintLoading(false);
      return;
    }
    const controller = { cancelled: false };
    if (!engineRef.current) engineRef.current = new StockfishEngine();
    const fenAtRequest = fen;
    setHintLoading(true);
    engineRef.current.bestMoveHint(fenAtRequest).then(({ bestMove, info }) => {
      if (controller.cancelled) return;
      setHintLoading(false);
      if (!bestMove || gameRef.current.fen() !== fenAtRequest) {
        setEngineHint(null);
        return;
      }
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
      setEngineHint({ from, to, san, reason, evalText: formatEval(info, lang) });
    });
    return () => {
      controller.cancelled = true;
    };
  }, [isTraining, showHints, isMyTurn, bookMove, fen, lang, t]);

  const arrows: Arrow[] = [];
  if (bookMove)
    arrows.push({
      startSquare: bookMove.from,
      endSquare: bookMove.to,
      color: BOOK_ARROW_COLOR,
    });
  else if (engineHint && showHints)
    arrows.push({
      startSquare: engineHint.from,
      endSquare: engineHint.to,
      color: ENGINE_ARROW_COLOR,
    });

  const orientation: "white" | "black" = myColor ?? "white";

  const statusText = (() => {
    if (!row) return t("status.loading");
    if (row.status === "finished")
      return row.winner === "draw"
        ? t("status.overDraw")
        : row.winner === "white"
          ? t("status.overWhite")
          : t("status.overBlack");
    if (!bothSeated) return t("status.waiting");
    if (game.isCheckmate()) return t("status.mate");
    if (isMyTurn) return t("status.your");
    return t("status.opp");
  })();

  const meWhite = orientation === "white";
  const oppColor = meWhite ? "black" : "white";
  const cap = capturedFromFen(fen);
  const myCaptures = meWhite ? cap.byWhite : cap.byBlack;
  const oppCaptures = meWhite ? cap.byBlack : cap.byWhite;
  const myAdv = meWhite ? cap.diff : -cap.diff;

  return (
    <div className="layout">
      <section className="board-col">
        <CapturedTray
          pieces={oppCaptures}
          pieceColor={orientation}
          advantage={myAdv < 0 ? -myAdv : undefined}
          label={t("game.opponent")}
        />
        <div className="board-wrap">
          <GameBoard
            fen={fen}
            orientation={orientation}
            arrows={arrows}
            interactive={isMyTurn}
            squareStyles={
              row?.status === "finished" &&
              (row.winner === "white" || row.winner === "black") &&
              !game.isCheckmate()
                ? kingRed(game, row.winner === "white" ? "b" : "w")
                : checkHighlight(game)
            }
            onPieceDrop={onPieceDrop}
          />
        </div>
        <CapturedTray
          pieces={myCaptures}
          pieceColor={oppColor}
          advantage={myAdv > 0 ? myAdv : undefined}
          label={t("game.you")}
        />
      </section>

      <aside className="panel">
        <div className="status" data-thinking={!isMyTurn && row?.status === "active"}>
          {statusText}
        </div>

        <div className="field">
          <span className="field__label">{t("online.mode")}</span>
          <p className="field__hint">
            {row?.mode === "training"
              ? t("online.trainingDesc")
              : t("online.ratedDesc")}
            {opening && (
              <>
                {" "}
                {t("online.opening", {
                  name: openingName(opening.id, opening.name, lang),
                })}
              </>
            )}
          </p>
        </div>

        {!bothSeated && row?.status === "waiting" && (
          <div className="field">
            <span className="field__label">{t("online.waiting")}</span>
            <p className="field__hint">
              {row?.opponent_id
                ? t("online.challengeSent")
                : t("online.searching")}
            </p>
          </div>
        )}

        {isTraining && (
          <div className="hint-box">
            <label className="toggle">
              <input
                type="checkbox"
                checked={showHints}
                onChange={(e) => setShowHints(e.target.checked)}
              />
              {t("hints.show")}
            </label>
            {showHints && bookMove && (
              <div className="hint hint--book">
                <div className="hint__head">
                  📖 {t("hints.theory")}: <b>{bookMove.san}</b>
                </div>
                {bookReason && <div className="hint__why">{bookReason}</div>}
              </div>
            )}
            {showHints && !bookMove && isMyTurn && engineHint && (
              <div className="hint hint--engine">
                <div className="hint__head">
                  🤖 {t("hints.engine")}: <b>{engineHint.san}</b>
                  {engineHint.evalText && (
                    <span className="hint__eval mono">{engineHint.evalText}</span>
                  )}
                </div>
                <div className="hint__why">{engineHint.reason}</div>
              </div>
            )}
            {showHints && !bookMove && isMyTurn && hintLoading && !engineHint && (
              <p className="hint">{t("hints.thinking")}</p>
            )}
          </div>
        )}

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

        <div className="session-actions">
          {myColor && row?.status === "active" && (
            <button className="btn-danger" onClick={resign}>
              {t("online.resign")}
            </button>
          )}
          {myColor && row?.status === "waiting" && (
            <button className="btn-danger" onClick={abortGame}>
              {t("online.cancel")}
            </button>
          )}
          {(row?.status === "finished" || row?.status === "aborted") && (
            <button className="btn-reset" onClick={() => navigate("/lobby")}>
              {t("online.back")}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

export default OnlineGamePage;
