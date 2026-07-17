import { FACE_DESIGNS } from "../cube/constants";
import {
  FACE_NAMES,
  type FaceName,
  type GridPosition,
  type ImageAsset,
  type Sticker,
} from "../cube/types";

interface StickerTargetEditorProps {
  sticker: Sticker | null;
  image?: ImageAsset;
  positionOwners: Record<string, string>;
  onChangeTargetFace: (face: FaceName) => void;
  onChangeTargetPosition: (position: GridPosition) => void;
  onChangeRotation: (rotation: 0 | 90 | 180 | 270) => void;
  onClear: () => void;
}

const GRID_VALUES = [0, 1, 2] as const;
const ROTATION_OPTIONS = [
  {
    value: 0,
    label: "0°",
    description: "원래 방향",
  },
  {
    value: 90,
    label: "↻ 90°",
    description: "시계 방향",
  },
  {
    value: 180,
    label: "180°",
    description: "반 바퀴",
  },
  {
    value: 270,
    label: "↺ 90°",
    description: "반시계 방향",
  },
] as const;

function createTargetPositionKey(
  face: FaceName,
  position: GridPosition,
): string {
  return `${face}-${position.row}-${position.col}`;
}

export function StickerTargetEditor({
  sticker,
  image,
  positionOwners,
  onChangeTargetFace,
  onChangeTargetPosition,
  onChangeRotation,
  onClear,
}: StickerTargetEditorProps) {
  if (!sticker) {
    return (
      <section className="sticker-target-editor sticker-target-editor-empty">
        <p className="eyebrow">Sticker target</p>
        <h2>조각 목표 설정</h2>
        <p>아래 전개도에서 편집할 사진 조각을 선택하세요.</p>
      </section>
    );
  }

  const targetFace = sticker.targetFace;

  return (
    <section className="sticker-target-editor">
      <div className="sticker-target-editor-heading">
        <div>
          <p className="eyebrow">Sticker target</p>
          <h2>조각 목표 설정</h2>
          <p>
            현재 위치: {sticker.currentPosition.face}{" "}
            {sticker.currentPosition.row + 1}행{" "}
            {sticker.currentPosition.col + 1}열
          </p>
        </div>

        <button type="button" className="danger-text-button" onClick={onClear}>
          목표 설정 지우기
        </button>
      </div>

      <div className="sticker-target-editor-layout">
        <div className="sticker-target-preview">
          {image ? (
            <img
              src={image.url}
              alt={`${sticker.id} 조각`}
              style={{
                transform: `rotate(${sticker.targetRotation ?? 0}deg)`,
              }}
            />
          ) : (
            <span>사진 없음</span>
          )}
        </div>

        <div className="sticker-target-controls">
          <div className="sticker-target-control-group">
            <h3>1. 목표 면</h3>

            <div className="sticker-target-face-options">
              {FACE_NAMES.map((face) => {
                const design = FACE_DESIGNS[face];

                return (
                  <button
                    key={face}
                    type="button"
                    className={
                      targetFace === face
                        ? "sticker-target-face-button sticker-target-option-selected"
                        : "sticker-target-face-button"
                    }
                    onClick={() => onChangeTargetFace(face)}
                  >
                    <strong>{face}</strong>
                    <small>{design.label}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sticker-target-control-group">
            <h3>2. 목표 위치</h3>

            {!targetFace ? (
              <p className="sticker-target-help">목표 면을 먼저 선택하세요.</p>
            ) : (
              <div className="sticker-target-position-grid">
                {GRID_VALUES.flatMap((row) =>
                  GRID_VALUES.map((col) => {
                    const position: GridPosition = { row, col };
                    const key = createTargetPositionKey(targetFace, position);

                    const ownerId = positionOwners[key];
                    const occupiedByOther =
                      Boolean(ownerId) && ownerId !== sticker.id;

                    const selected =
                      sticker.targetPosition?.row === row &&
                      sticker.targetPosition?.col === col;

                    return (
                      <button
                        key={key}
                        type="button"
                        className={[
                          "sticker-target-position-button",
                          selected ? "sticker-target-option-selected" : "",
                          occupiedByOther
                            ? "sticker-target-position-occupied"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={occupiedByOther}
                        title={
                          occupiedByOther
                            ? "다른 조각이 이미 사용 중인 위치입니다."
                            : `${row + 1}행 ${col + 1}열`
                        }
                        onClick={() => onChangeTargetPosition(position)}
                      >
                        {occupiedByOther ? "사용 중" : `${row + 1},${col + 1}`}
                      </button>
                    );
                  }),
                )}
              </div>
            )}
          </div>

          <div className="sticker-target-control-group">
            <h3>3. 목표 회전</h3>

            <div className="sticker-target-rotation-options">
              {ROTATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    sticker.targetRotation === option.value
                      ? "sticker-target-rotation-button sticker-target-option-selected"
                      : "sticker-target-rotation-button"
                  }
                  title={option.description}
                  onClick={() => onChangeRotation(option.value)}
                >
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="sticker-target-summary">
            <strong>현재 설정</strong>
            <span>
              면: {targetFace ?? "미지정"} / 위치:{" "}
              {sticker.targetPosition
                ? `${sticker.targetPosition.row + 1},${
                    sticker.targetPosition.col + 1
                  }`
                : "미지정"}{" "}
              / 회전:{" "}
              {sticker.targetRotation === null
                ? "미지정"
                : `${sticker.targetRotation}°`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
