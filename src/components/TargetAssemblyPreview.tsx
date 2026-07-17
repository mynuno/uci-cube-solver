import { FACE_DESIGNS } from "../cube/constants";
import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
  type Sticker,
} from "../cube/types";

interface TargetAssemblyPreviewProps {
  cubeState: CubeState;
  selectedFace: FaceName;
  onSelectFace: (face: FaceName) => void;
  onSelectSticker: (stickerId: string) => void;
}

const GRID_VALUES = [0, 1, 2] as const;

function findStickerAtTargetPosition(
  cubeState: CubeState,
  face: FaceName,
  position: GridPosition,
): Sticker | undefined {
  return Object.values(cubeState.stickers).find(
    (sticker) =>
      sticker.targetFace === face &&
      sticker.targetPosition?.row === position.row &&
      sticker.targetPosition.col === position.col,
  );
}

function countCompletedPositions(
  cubeState: CubeState,
  face: FaceName,
): number {
  return Object.values(cubeState.stickers).filter(
    (sticker) =>
      sticker.targetFace === face &&
      sticker.targetPosition !== null &&
      sticker.targetRotation !== null,
  ).length;
}

export function TargetAssemblyPreview({
  cubeState,
  selectedFace,
  onSelectFace,
  onSelectSticker,
}: TargetAssemblyPreviewProps) {
  const selectedDesign = FACE_DESIGNS[selectedFace];
  const completedCount = countCompletedPositions(
    cubeState,
    selectedFace,
  );

  return (
    <section className="target-assembly">
      <div className="target-assembly-heading">
        <div>
          <p className="eyebrow">Target assembly</p>
          <h2>목표 그림 미리보기</h2>
          <p>
            목표 위치와 회전을 적용한 완성 예상 모습입니다.
          </p>
        </div>

        <div
          className={
            completedCount === 9
              ? "target-assembly-count target-assembly-count-complete"
              : "target-assembly-count"
          }
        >
          {completedCount}/9
        </div>
      </div>

      <div className="target-assembly-layout">
        <div className="target-assembly-face-tabs">
          {FACE_NAMES.map((face) => {
            const design = FACE_DESIGNS[face];
            const count = countCompletedPositions(cubeState, face);

            return (
              <button
                key={face}
                type="button"
                className={
                  selectedFace === face
                    ? "target-assembly-face-tab target-assembly-face-tab-selected"
                    : "target-assembly-face-tab"
                }
                onClick={() => onSelectFace(face)}
              >
                <strong>{face}</strong>
                <span>{design.label}</span>
                <small>{count}/9</small>
              </button>
            );
          })}
        </div>

        <div className="target-assembly-preview-panel">
          <header className="target-assembly-preview-header">
            <div>
              <strong>{selectedFace}</strong>
              <span>{selectedDesign.label}</span>
            </div>
          </header>

          <div className="target-assembly-grid">
            {GRID_VALUES.flatMap((row) =>
              GRID_VALUES.map((col) => {
                const position: GridPosition = {
                  row,
                  col,
                };

                const sticker = findStickerAtTargetPosition(
                  cubeState,
                  selectedFace,
                  position,
                );

                const image =
                  sticker?.imageId &&
                  cubeState.images[sticker.imageId]
                    ? cubeState.images[sticker.imageId]
                    : undefined;

                const rotation =
                  sticker?.targetRotation ?? 0;

                return (
                  <button
                    key={`${selectedFace}-${row}-${col}`}
                    type="button"
                    className={
                      sticker
                        ? "target-assembly-cell target-assembly-cell-filled"
                        : "target-assembly-cell"
                    }
                    disabled={!sticker}
                    title={
                      sticker
                        ? `${sticker.id} 선택`
                        : `${row + 1}행 ${col + 1}열 미지정`
                    }
                    onClick={() => {
                      if (sticker) {
                        onSelectSticker(sticker.id);
                      }
                    }}
                  >
                    {image ? (
                      <img
                        src={image.url}
                        alt={`${selectedFace} ${row + 1},${
                          col + 1
                        } 조각`}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                        }}
                      />
                    ) : (
                      <span>
                        {row + 1},{col + 1}
                      </span>
                    )}

                    {sticker && (
                      <small>
                        {rotation}°
                      </small>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}