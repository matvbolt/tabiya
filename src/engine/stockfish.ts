
const ENGINE_URL = "/engine/stockfish-18-lite-single.js";

export type EvalInfo = {

  bestMove: string | null;

  scoreCp: number | null;

  mateIn: number | null;
  depth: number;
};

type BestMoveResult = {
  bestMove: string | null;
  info: EvalInfo;
};

export class StockfishEngine {
  private worker: Worker;
  private ready: Promise<void>;
  private listeners = new Set<(line: string) => void>();

  private lock: Promise<unknown> = Promise.resolve();

  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === "string" ? e.data : String(e.data);
      for (const l of this.listeners) l(line);
    };

    this.ready = this.handshake();
  }

  private run<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.lock.then(fn, fn);
    this.lock = result.catch(() => undefined);
    return result;
  }

  private send(cmd: string) {
    this.worker.postMessage(cmd);
  }

  private waitFor(predicate: (line: string) => boolean): Promise<string> {
    return new Promise((resolve) => {
      const listener = (line: string) => {
        if (predicate(line)) {
          this.listeners.delete(listener);
          resolve(line);
        }
      };
      this.listeners.add(listener);
    });
  }

  private async handshake() {
    this.send("uci");
    await this.waitFor((l) => l === "uciok");
    this.send("isready");
    await this.waitFor((l) => l === "readyok");
  }

  bestMoveForBot(fen: string, elo: number, movetimeMs = 600) {
    return this.run(async () => {
      await this.ready;
      this.send("setoption name UCI_LimitStrength value true");
      this.send(`setoption name UCI_Elo value ${Math.round(elo)}`);
      return this.analyse(fen, { movetimeMs });
    });
  }

  bestMoveHint(fen: string, depth = 15) {
    return this.run(async () => {
      await this.ready;
      this.send("setoption name UCI_LimitStrength value false");
      return this.analyse(fen, { depth });
    });
  }

  private async analyse(
    fen: string,
    opts: { depth?: number; movetimeMs?: number }
  ): Promise<BestMoveResult> {
    await this.ready;

    let latest: EvalInfo = {
      bestMove: null,
      scoreCp: null,
      mateIn: null,
      depth: 0,
    };

    const collect = (line: string) => {
      if (!line.startsWith("info")) return;
      const depthMatch = line.match(/\bdepth (\d+)/);
      const cpMatch = line.match(/\bscore cp (-?\d+)/);
      const mateMatch = line.match(/\bscore mate (-?\d+)/);
      const pvMatch = line.match(/\bpv (\S+)/);
      if (depthMatch) latest.depth = Number(depthMatch[1]);
      if (cpMatch) {
        latest.scoreCp = Number(cpMatch[1]);
        latest.mateIn = null;
      }
      if (mateMatch) {
        latest.mateIn = Number(mateMatch[1]);
        latest.scoreCp = null;
      }
      if (pvMatch) latest.bestMove = pvMatch[1];
    };
    this.listeners.add(collect);

    this.send(`position fen ${fen}`);
    const go =
      opts.movetimeMs != null
        ? `go movetime ${opts.movetimeMs}`
        : `go depth ${opts.depth ?? 12}`;
    this.send(go);

    const bestLine = await this.waitFor((l) => l.startsWith("bestmove"));
    this.listeners.delete(collect);

    const best = bestLine.split(" ")[1] ?? null;
    latest.bestMove = best && best !== "(none)" ? best : latest.bestMove;

    return { bestMove: latest.bestMove, info: latest };
  }

  dispose() {
    this.send("quit");
    this.worker.terminate();
    this.listeners.clear();
  }
}
