import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import './Window.css';

type Position = { x: number; y: number };

type WindowProps = {
  title: string;
  children: ReactNode;
  initialPosition?: Position;
  onClose?: () => void;
};

// Keeps part of the title bar on screen so the window can always be grabbed again.
const MIN_VISIBLE = 40;

export function Window({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  onClose,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  // Distance from the pointer to the window's top-left corner while dragging.
  const dragOffset = useRef<Position | null>(null);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    // Capture keeps move events coming even if the pointer outruns the title bar.
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragOffset.current) return;
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;
    const width = e.currentTarget.offsetWidth;
    setPosition({
      x: Math.min(
        Math.max(x, MIN_VISIBLE - width),
        window.innerWidth - MIN_VISIBLE,
      ),
      y: Math.min(Math.max(y, 0), window.innerHeight - MIN_VISIBLE),
    });
  }

  function stopDragging() {
    dragOffset.current = null;
  }

  return (
    <div className="window" style={{ left: position.x, top: position.y }}>
      <div
        className="window-titlebar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onLostPointerCapture={stopDragging}
      >
        <span className="window-title">{title}</span>
        {onClose && (
          <button
            type="button"
            className="window-close"
            aria-label="Close"
            // Keeps a press on the button from starting a title bar drag.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
