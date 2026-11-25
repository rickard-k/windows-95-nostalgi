import { useState, type ReactNode } from "react";
import { Window } from "./Window";
import "./FileIcon.css";

type FileIconProps = {
  name: string;
  children: ReactNode;
  // SVG shapes drawn in a 32×32 viewBox. Defaults to a text document.
  icon?: ReactNode;
};

const documentIcon = (
  <>
    <path d="M6 2h14l6 6v22H6z" fill="#fff" stroke="#000" />
    <path d="M20 2v6h6" fill="#c0c0c0" stroke="#000" />
    <path d="M10 13h12M10 17h12M10 21h12M10 25h8" stroke="#808080" />
  </>
);

export function FileIcon({
  name,
  children,
  icon = documentIcon,
}: FileIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="file-icon"
        onDoubleClick={() => setIsOpen(true)}
        // Double click has no keyboard equivalent, so Enter opens the file too.
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
      >
        <svg className="file-icon-image" viewBox="0 0 32 32" aria-hidden="true">
          {icon}
        </svg>
        <span className="file-icon-label">{name}</span>
      </button>
      {isOpen && (
        <Window title={name} onClose={() => setIsOpen(false)}>
          {children}
        </Window>
      )}
    </>
  );
}
