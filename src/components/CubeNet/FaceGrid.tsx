import type { CubeState, FaceName } from "../../cube/types";
import { FACE_DESIGNS } from "../../cube/constants";
import { StickerCell } from "./StickerCell";

interface FaceGridProps {
  face: FaceName;
  cubeState: CubeState;
  selectedStickerId: string | null;
  onStickerClick: (stickerId: string) => void;
}

export function FaceGrid({
  face,
  cubeState,
  selectedStickerId,
  onStickerClick,
}: FaceGridProps) {
  const design = FACE_DESIGNS[face];
  const grid = cubeState.faces[face];

  return (
    <section className="face-panel">
      <header className="face-header">
        <strong>{face}</strong>
        <span>{design.label}</span>
      </header>

      <div className="face-grid">
        {grid.flat().map((stickerId) => (
          <StickerCell
            key={stickerId}
            sticker={cubeState.stickers[stickerId]}
            selected={selectedStickerId === stickerId}
            onClick={() => onStickerClick(stickerId)}
          />
        ))}
      </div>
    </section>
  );
}