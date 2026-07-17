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
        {grid.flat().map((stickerId) => {
          const sticker = cubeState.stickers[stickerId];

          const image = sticker.imageId
            ? cubeState.images[sticker.imageId]
            : undefined;

          return (
            <StickerCell
              key={stickerId}
              sticker={sticker}
              image={image}
              selected={selectedStickerId === stickerId}
              onClick={() => onStickerClick(stickerId)}
            />
          );
        })}
      </div>
    </section>
  );
}