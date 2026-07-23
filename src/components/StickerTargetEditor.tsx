import { FACE_DESIGNS } from "../cube/constants";
import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
  type ImageAsset,
  type Sticker,
} from "../cube/types";

interface StickerTargetEditorProps {
  cubeState: CubeState;
  sticker: Sticker | null;
  image?: ImageAsset;
  previewFace: FaceName;
  positionOwners: Record<string, string>;
  onSelectTargetFace: (face: FaceName) => void;
  onChangeTargetPosition: (
    face: FaceName,
    position: GridPosition,
  ) => void;
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

function countCompletedPositions(
  cubeState: CubeState,
  face: FaceName,
): number {
  return Object.values(cubeState.stickers).filter(
    (targetSticker) =>
      targetSticker.targetFace === face &&
      targetSticker.targetPosition !== null &&
      targetSticker.targetRotation !== null,
  ).length;
}

export function StickerTargetEditor({
  cubeState,
  sticker,
  image,
  previewFace,
  positionOwners,
  onSelectTargetFace,
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
  const completedCount = countCompletedPositions(cubeState, previewFace);
  const assignmentComplete =
    targetFace !== null &&
    sticker.targetPosition !== null &&
    sticker.targetRotation !== null;

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
        <div className="sticker-target-preview-column">
          <div className="sticker-target-assembly-heading">
            <strong>
              {previewFace}면 배치 미리보기
            </strong>
            <span
              className={
                completedCount === 9
                  ? "sticker-target-assembly-count sticker-target-assembly-count-complete"
                  : "sticker-target-assembly-count"
              }
            >
              {completedCount}/9
            </span>
          </div>

          <div
            className="sticker-target-assembly-grid"
            aria-label={`${previewFace}면 목표 조각 배치`}
          >
            {GRID_VALUES.flatMap((row) =>
              GRID_VALUES.map((col) => {
                const position: GridPosition = { row, col };
                const key = createTargetPositionKey(previewFace, position);
                  const ownerId = positionOwners[key];
                  const targetSticker = ownerId
                    ? cubeState.stickers[ownerId]
                    : undefined;
                  const targetImageId = targetSticker?.imageId;
                  const targetImage = targetImageId
                    ? cubeState.images[targetImageId]
                    : undefined;
                  const isSelected = targetSticker?.id === sticker.id;

                  return (
                    <div
                      key={key}
                      className={[
                        "sticker-target-assembly-cell",
                        targetSticker
                          ? "sticker-target-assembly-cell-filled"
                          : "",
                        isSelected
                          ? "sticker-target-assembly-cell-selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      title={
                        targetSticker
                          ? `${targetSticker.id} · 회전 ${
                              targetSticker.targetRotation === null
                                ? "미지정"
                                : `${targetSticker.targetRotation}°`
                            }`
                          : `${row + 1}행 ${col + 1}열 · 비어 있음`
                      }
                    >
                      {targetSticker && targetImage ? (
                        <img
                          src={targetImage.url}
                          alt={`${targetSticker.id} 목표 조각`}
                          style={{
                            transform: `rotate(${
                              targetSticker.targetRotation ?? 0
                            }deg)`,
                          }}
                        />
                      ) : targetSticker ? (
                        <span className="sticker-target-assembly-sticker-id">
                          {targetSticker.id}
                        </span>
                      ) : (
                        <span className="sticker-target-assembly-position">
                          {row + 1},{col + 1}
                        </span>
                      )}
                    </div>
                  );
              }),
            )}
          </div>

          {completedCount === 9 && (
            <p className="sticker-target-face-complete-message">
              {previewFace}면의 9개 조각이 모두 저장되었습니다.
            </p>
          )}

          <div className="sticker-target-selected-piece">
            <div>
              <strong>현재 선택 조각</strong>
              <small>{sticker.id}</small>
            </div>
            <div className="sticker-target-selected-piece-image">
              {image ? (
                <img
                  src={image.url}
                  alt={`${sticker.id} 선택 조각`}
                  style={{
                    transform: `rotate(${sticker.targetRotation ?? 0}deg)`,
                  }}
                />
              ) : (
                <span>사진 없음</span>
              )}
            </div>
          </div>
        </div>

        <div className="sticker-target-controls">
          <div className="sticker-target-control-group">
            <h3>1. 목표 면</h3>

            <div className="sticker-target-face-options">
              {FACE_NAMES.map((face) => {
                const design = FACE_DESIGNS[face];
                const isActiveFace = previewFace === face;
                const isSavedFace = targetFace === face;

                return (
                  <button
                    key={face}
                    type="button"
                    className={
                      isActiveFace
                        ? "sticker-target-face-button sticker-target-option-selected"
                        : "sticker-target-face-button"
                    }
                    onClick={() => onSelectTargetFace(face)}
                  >
                    <strong>{face}</strong>
                    <small>
                      {design.label}
                      {isSavedFace ? " · 현재 배정" : ""}
                    </small>
                  </button>
                );
              })}
            </div>

            <p className="sticker-target-help">
              면을 선택해 배치를 확인한 뒤 빈 위치를 누르면, 선택 조각의
              목표 면과 위치가 함께 변경됩니다.
            </p>
          </div>

          <div className="sticker-target-control-group">
            <h3>2. 목표 위치</h3>

            <div className="sticker-target-position-grid">
              {GRID_VALUES.flatMap((row) =>
                GRID_VALUES.map((col) => {
                  const position: GridPosition = { row, col };
                  const key = createTargetPositionKey(previewFace, position);
                  const ownerId = positionOwners[key];
                  const selected = ownerId === sticker.id;
                  const occupiedByOther = Boolean(ownerId) && !selected;

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
                          : selected
                            ? "현재 선택 조각이 저장된 위치입니다."
                            : `${row + 1}행 ${col + 1}열에 저장`
                      }
                      onClick={() =>
                        onChangeTargetPosition(previewFace, position)
                      }
                    >
                      {occupiedByOther
                        ? "사용 중"
                        : selected
                          ? "현재"
                          : `${row + 1},${col + 1}`}
                    </button>
                  );
                }),
              )}
            </div>
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

          <div
            className={
              assignmentComplete
                ? "sticker-target-summary sticker-target-summary-complete"
                : "sticker-target-summary"
            }
          >
            <strong>
              {assignmentComplete ? "현재 설정 · 저장됨" : "현재 설정"}
            </strong>
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
