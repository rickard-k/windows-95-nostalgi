import { useEffect, useState, type MouseEvent } from "react";
import "./Minesweeper.css";

const SIZE = 9;
const MINES = 10;

type Cell = {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
};

type Status = "ready" | "playing" | "won" | "lost";

function emptyBoard(): Cell[] {
  return Array.from({ length: SIZE * SIZE }, () => ({
    mine: false,
    adjacent: 0,
    revealed: false,
    flagged: false,
  }));
}

function neighbors(index: number): number[] {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if ((dr || dc) && r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
        result.push(r * SIZE + c);
      }
    }
  }
  return result;
}

// Mines are placed on the first click, so that click can never hit one.
function placeMines(board: Cell[], safeIndex: number): Cell[] {
  const candidates = board.map((_, i) => i).filter((i) => i !== safeIndex);
  // Partial Fisher-Yates shuffle: the first MINES entries become a random pick.
  for (let i = 0; i < MINES; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const mines = new Set(candidates.slice(0, MINES));
  return board.map((cell, i) => ({
    ...cell,
    mine: mines.has(i),
    adjacent: neighbors(i).filter((n) => mines.has(n)).length,
  }));
}

function reveal(board: Cell[], start: number): Cell[] {
  const next = board.map((cell) => ({ ...cell }));
  const stack = [start];
  while (stack.length > 0) {
    const index = stack.pop()!;
    const cell = next[index];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    // A blank cell opens its neighbours too, spreading across the empty area.
    if (!cell.mine && cell.adjacent === 0) stack.push(...neighbors(index));
  }
  return next;
}

// Desktop icon: a mine on a raised grey tile, drawn in a 32×32 viewBox.
export function MinesweeperIcon() {
  return (
    <>
      <rect x="1" y="1" width="30" height="30" fill="#c0c0c0" />
      <path d="M1 31V1h30" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M1 31h30V1" fill="none" stroke="#808080" strokeWidth="2" />
      <path
        d="M16 5v22M5 16h22M8.5 8.5l15 15M23.5 8.5l-15 15"
        stroke="#000"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="7" fill="#000" />
      <rect x="12" y="12" width="3" height="3" fill="#fff" />
    </>
  );
}

function formatCounter(n: number): string {
  return n < 0 ? "-" + String(-n).padStart(2, "0") : String(n).padStart(3, "0");
}

export function Minesweeper() {
  const [board, setBoard] = useState(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);
  const [exploded, setExploded] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    return () => clearInterval(id);
  }, [status]);

  const gameOver = status === "won" || status === "lost";
  const flagCount = board.filter((cell) => cell.flagged).length;

  function handleReveal(index: number) {
    if (gameOver || board[index].revealed || board[index].flagged) return;
    const current = status === "ready" ? placeMines(board, index) : board;
    const next = reveal(current, index);

    if (next[index].mine) {
      setBoard(
        next.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)),
      );
      setExploded(index);
      setStatus("lost");
    } else if (next.every((cell) => cell.mine || cell.revealed)) {
      setBoard(
        next.map((cell) => (cell.mine ? { ...cell, flagged: true } : cell)),
      );
      setStatus("won");
    } else {
      setBoard(next);
      setStatus("playing");
    }
  }

  function handleFlag(e: MouseEvent, index: number) {
    e.preventDefault();
    if (gameOver || board[index].revealed) return;
    setBoard(
      board.map((cell, i) =>
        i === index ? { ...cell, flagged: !cell.flagged } : cell,
      ),
    );
  }

  function restart() {
    setBoard(emptyBoard());
    setStatus("ready");
    setSeconds(0);
    setExploded(null);
  }

  const face = status === "lost" ? "😵" : status === "won" ? "😎" : "🙂";

  return (
    <div className="minesweeper">
      <div className="minesweeper-header">
        <span className="minesweeper-counter">
          {formatCounter(MINES - flagCount)}
        </span>
        <button
          type="button"
          className="minesweeper-face"
          aria-label="New game"
          onClick={restart}
        >
          {face}
        </button>
        <span className="minesweeper-counter">{formatCounter(seconds)}</span>
      </div>
      <div
        className="minesweeper-grid"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 16px)` }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className="minesweeper-cell"
            data-revealed={cell.revealed || undefined}
            data-exploded={i === exploded || undefined}
            data-n={cell.revealed && !cell.mine ? cell.adjacent : undefined}
            onClick={() => handleReveal(i)}
            onContextMenu={(e) => handleFlag(e, i)}
          >
            {cell.revealed
              ? cell.mine
                ? "💣"
                : cell.adjacent || ""
              : cell.flagged
                ? "🚩"
                : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
