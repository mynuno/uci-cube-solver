import { FACE_NAMES } from "../../cube/types";
import { FACE_NET_POSITIONS } from "../../cube/constants";
import type { CubeState } from "../../cube/types";
import { FaceGrid } from "./FaceGrid";

interface CubeNetProps {
  cubeState: CubeState;
  selectedStickerId: string | null;
  onStickerClick: (stickerId: string) => void;
}

export function CubeNet({
  cubeState,
  selectedStickerId,
  onStickerClick,
}: CubeNetProps) {
  return (
    <div className="cube-net">
      {FACE_NAMES.map((face) => {
        const position = FACE_NET_POSITIONS[face];

        return (
          <div
            key={face}
            style={{
              gridRow: position.gridRow + 1,
              gridColumn: position.gridColumn + 1,
            }}
          >
            <FaceGrid
              face={face}
              cubeState={cubeState}
              selectedStickerId={selectedStickerId}
              onStickerClick={onStickerClick}
            />
          </div>
        );
      })}
    </div>
  );
}