import { useEffect, useReducer, useRef, type KeyboardEvent } from "react";
import "./Snake.css";

const SIZE = 15;
const TICK_MS = 120;
// Turns pressed faster than the snake moves wait here, so quick U-turns work.
const MAX_QUEUED_TURNS = 2;

type Direction = "up" | "down" | "left" | "right";
type Status = "ready" | "playing" | "over" | "won";

type State = {
  // Cell indices, head first.
  snake: number[];
  direction: Direction;
  queuedTurns: Direction[];
  food: number;
  status: Status;
  score: number;
  best: number;
};

type Action =
  | { type: "turn"; direction: Direction }
  // The random number is chosen by the caller so the reducer stays pure.
  | { type: "tick"; random: number }
  | { type: "restart" };

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

// Returns the next cell, or null when the move would leave the board.
function step(index: number, direction: Direction): number | null {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  switch (direction) {
    case "up":
      return row > 0 ? index - SIZE : null;
    case "down":
      return row < SIZE - 1 ? index + SIZE : null;
    case "left":
      return col > 0 ? index - 1 : null;
    case "right":
      return col < SIZE - 1 ? index + 1 : null;
  }
}

function placeFood(snake: number[], random: number): number {
  const occupied = new Set(snake);
  const free: number[] = [];
  for (let i = 0; i < SIZE * SIZE; i++) if (!occupied.has(i)) free.push(i);
  return free[Math.floor(random * free.length)];
}

function initialState(best = 0): State {
  const mid = Math.floor(SIZE / 2) * SIZE + Math.floor(SIZE / 2);
  return {
    snake: [mid, mid - 1, mid - 2],
    direction: "right",
    queuedTurns: [],
    food: mid + 4,
    status: "ready",
    score: 0,
    best,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "restart":
      return initialState(state.best);

    case "turn": {
      if (state.status === "over" || state.status === "won") return state;
      const last = state.queuedTurns.at(-1) ?? state.direction;
      if (
        action.direction === last ||
        action.direction === OPPOSITE[last] ||
        state.queuedTurns.length >= MAX_QUEUED_TURNS
      ) {
        // The first key press still starts the game, even if it is ignored as a turn.
        return state.status === "ready" ? { ...state, status: "playing" } : state;
      }
      return {
        ...state,
        status: "playing",
        queuedTurns: [...state.queuedTurns, action.direction],
      };
    }

    case "tick": {
      if (state.status !== "playing") return state;
      const [direction = state.direction, ...queuedTurns] = state.queuedTurns;
      const head = step(state.snake[0], direction);
      const eating = head === state.food;
      // The tail moves out of the way this tick unless the snake is growing.
      const body = eating ? state.snake : state.snake.slice(0, -1);

      if (head === null || body.includes(head)) {
        return {
          ...state,
          direction,
          queuedTurns: [],
          status: "over",
          best: Math.max(state.best, state.score),
        };
      }

      const snake = [head, ...body];
      if (!eating) return { ...state, snake, direction, queuedTurns };

      const score = state.score + 1;
      if (snake.length === SIZE * SIZE) {
        return {
          ...state,
          snake,
          direction,
          queuedTurns,
          score,
          status: "won",
          best: Math.max(state.best, score),
        };
      }
      return {
        ...state,
        snake,
        direction,
        queuedTurns,
        score,
        food: placeFood(snake, action.random),
      };
    }
  }
}

// Desktop icon: a green snake on a raised grey tile, drawn in a 32×32 viewBox.
export function SnakeIcon() {
  return (
    <>
      <rect x="1" y="1" width="30" height="30" fill="#c0c0c0" />
      <path d="M1 31V1h30" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M1 31h30V1" fill="none" stroke="#808080" strokeWidth="2" />
      <path
        d="M7 25h12v-6H11v-6h14"
        fill="none"
        stroke="#008000"
        strokeWidth="4"
        strokeLinejoin="miter"
      />
      <rect x="23" y="9" width="4" height="8" fill="#008000" />
      <rect x="24" y="11" width="1" height="1" fill="#000" />
      <rect x="23" y="22" width="4" height="4" fill="#f00" />
    </>
  );
}

function formatCounter(n: number): string {
  return String(Math.min(n, 999)).padStart(3, "0");
}

export function Snake() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState(),
  );
  const boardRef = useRef<HTMLDivElement>(null);

  // Focus the board when the window opens so arrow keys work straight away.
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = setInterval(
      () => dispatch({ type: "tick", random: Math.random() }),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [state.status]);

  function handleKeyDown(e: KeyboardEvent) {
    const direction = KEYS[e.key];
    if (direction) {
      e.preventDefault();
      dispatch({ type: "turn", direction });
    } else if (e.key === " " && state.status !== "playing") {
      e.preventDefault();
      dispatch({ type: "restart" });
    }
  }

  function restart() {
    dispatch({ type: "restart" });
    boardRef.current?.focus();
  }

  const body = new Set(state.snake);
  const head = state.snake[0];
  const face =
    state.status === "over" ? "😵" : state.status === "won" ? "😎" : "🙂";
  const message =
    state.status === "ready"
      ? "Press an arrow key"
      : state.status === "over"
        ? "Game over"
        : state.status === "won"
          ? "You win!"
          : null;

  return (
    <div className="snake">
      <div className="snake-header">
        <span className="snake-counter" title="Score">
          {formatCounter(state.score)}
        </span>
        <button
          type="button"
          className="snake-face"
          aria-label="New game"
          onClick={restart}
        >
          {face}
        </button>
        <span className="snake-counter" title="Best">
          {formatCounter(state.best)}
        </span>
      </div>
      <div
        ref={boardRef}
        className="snake-board"
        tabIndex={0}
        role="application"
        aria-label="Snake board. Use the arrow keys to steer."
        onKeyDown={handleKeyDown}
        style={{ gridTemplateColumns: `repeat(${SIZE}, 12px)` }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <div
            key={i}
            className="snake-cell"
            data-kind={
              i === head
                ? "head"
                : body.has(i)
                  ? "body"
                  : i === state.food
                    ? "food"
                    : undefined
            }
          />
        ))}
        {message && <div className="snake-message">{message}</div>}
      </div>
    </div>
  );
}
