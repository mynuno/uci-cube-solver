import type { FaceName, Sticker } from "../../cube/types";
import { FACE_DESIGNS } from "../../cube/constants";

interface StickerCellProps {
  sticker: Sticker;
  selected: boolean;
  onClick: () => void;
}

const BACKGROUND_COLORS: Record<string, string> = {
  white: "#ffffff",
  yellow: "#ffd200",
  navy: "#0c2340",
};

const FOREGROUND_COLORS: Record<string, string> = {
  white: "#ffffff",
  yellow: "#ffd200",
  navy: "#0c2340",
};

function getTargetFaceStyle(targetFace: FaceName | null) {
  if (!targetFace) {
    return undefined;
  }

  const design = FACE_DESIGNS[targetFace];

  return {
    backgroundColor: BACKGROUND_COLORS[design.background],
    color: FOREGROUND_COLORS[design.foreground],
  };
}

export function StickerCell({
  sticker,
  selected,
  onClick,
}: StickerCellProps) {
  const { face, row, col } = sticker.currentPosition;

  return (
    <button
      type="button"
      className={`sticker-cell ${selected ? "sticker-cell-selected" : ""}`}
      title={sticker.id}
      style={getTargetFaceStyle(sticker.targetFace)}
      onClick={onClick}
    >
      <span>{sticker.targetFace ?? "?"}</span>

      <small>
        {face} {row},{col}
      </small>
    </button>
  );
}