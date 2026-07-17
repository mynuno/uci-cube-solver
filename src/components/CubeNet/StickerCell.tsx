import type {
  FaceName,
  ImageAsset,
  Sticker,
} from "../../cube/types";
import { FACE_DESIGNS } from "../../cube/constants";

interface StickerCellProps {
  sticker: Sticker;
  image?: ImageAsset;
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
  image,
  selected,
  onClick,
}: StickerCellProps) {
  const { face, row, col } = sticker.currentPosition;

  return (
    <button
      type="button"
      className={`sticker-cell ${
        selected ? "sticker-cell-selected" : ""
      }`}
      title={sticker.id}
      style={image ? undefined : getTargetFaceStyle(sticker.targetFace)}
      onClick={onClick}
    >
      {image ? (
        <img
          className="sticker-cell-image"
          src={image.url}
          alt={`${face} ${row},${col} 조각`}
        />
      ) : (
        <span className="sticker-target-label">
          {sticker.targetFace ?? "?"}
        </span>
      )}

      <small className="sticker-position-label">
        {face} {row},{col}
      </small>

      {image && sticker.targetFace && (
        <span className="sticker-target-badge">
          {sticker.targetFace}
        </span>
      )}
    </button>
  );
}