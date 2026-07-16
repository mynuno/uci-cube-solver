import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { FaceName } from "../../cube/types";
import type { FacePhoto, NormalizedPoint } from "../../image/types";
import { PerspectivePreview } from "./PerspectivePreview";

interface CornerEditorProps {
  face: FaceName;
  photo: FacePhoto;
  onClose: () => void;
  onSave: (face: FaceName, corners: NormalizedPoint[]) => void;
}

interface DragState {
  pointIndex: number;
}

const GUIDE_LABELS = [
  "1. 좌측 위",
  "2. 우측 위",
  "3. 우측 아래",
  "4. 좌측 아래",
];

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function CornerEditor({
  face,
  photo,
  onClose,
  onSave,
}: CornerEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  const [points, setPoints] = useState<NormalizedPoint[]>(
    photo.corners.map((point) => ({ ...point })),
  );

  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function getPointFromPointer(
    clientX: number,
    clientY: number,
    allowOutside = false,
  ): NormalizedPoint | null {
    const image = imageRef.current;

    if (!image) {
      return null;
    }

    const rect = image.getBoundingClientRect();

    if (!allowOutside) {
      const isOutsideImage =
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom;

      if (isOutsideImage) {
        return null;
      }
    }

    return {
      x: clamp((clientX - rect.left) / rect.width),
      y: clamp((clientY - rect.top) / rect.height),
    };
  }

  function handleStagePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (points.length >= 4) {
      return;
    }

    const point = getPointFromPointer(event.clientX, event.clientY);

    if (!point) {
      return;
    }

    setPoints((previousPoints) => [...previousPoints, point]);
  }

  function handlePointPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    pointIndex: number,
  ) {
    event.stopPropagation();
    event.preventDefault();

    event.currentTarget.setPointerCapture(event.pointerId);

    setDragState({
      pointIndex,
    });
  }

  function handlePointPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (!dragState) {
      return;
    }

    const nextPoint = getPointFromPointer(
      event.clientX,
      event.clientY,
      true,
    );

    if (!nextPoint) {
      return;
    }

    setPoints((previousPoints) =>
      previousPoints.map((point, index) =>
        index === dragState.pointIndex ? nextPoint : point,
      ),
    );
  }

  function handlePointPointerUp(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
  }

  function handleReset() {
    setPoints([]);
    setDragState(null);
  }

  function handleSave() {
    if (points.length !== 4) {
      return;
    }

    onSave(
      face,
      points.map((point) => ({ ...point })),
    );
  }

  return (
    <div
      className="corner-editor-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="corner-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="corner-editor-title"
      >
        <header className="corner-editor-header">
          <div>
            <p className="eyebrow">Perspective setup</p>
            <h2 id="corner-editor-title">{face}면 네 꼭짓점 지정</h2>
          </div>

          <button
            type="button"
            className="corner-editor-close"
            aria-label="편집기 닫기"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <p className="corner-editor-description">
          큐브 면의 정사각형 테두리를 기준으로 좌측 위부터 시계 방향으로
          네 점을 선택하세요. 선택한 점은 드래그해서 수정할 수 있습니다.
        </p>

        <div className="corner-editor-layout">
          <div className="corner-editor-main">
            <div className="corner-editor-image">
              <div
                className="corner-editor-image-stage"
                onPointerDown={handleStagePointerDown}
              >
                <img
                  ref={imageRef}
                  src={photo.previewUrl}
                  alt={`${face}면 꼭짓점 선택`}
                  draggable={false}
                />

                {points.length >= 2 && (
                  <svg
                    className="corner-editor-overlay"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polyline
                      points={[
                        ...points,
                        ...(points.length === 4 ? [points[0]] : []),
                      ]
                        .map((point) => `${point.x},${point.y}`)
                        .join(" ")}
                      fill={
                        points.length === 4
                          ? "rgba(0, 100, 164, 0.16)"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="0.006"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}

                {points.map((point, index) => (
                  <button
                    key={index}
                    type="button"
                    className="corner-point"
                    style={{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                    }}
                    aria-label={`${index + 1}번 꼭짓점`}
                    onPointerDown={(event) =>
                      handlePointPointerDown(event, index)
                    }
                    onPointerMove={handlePointPointerMove}
                    onPointerUp={handlePointPointerUp}
                    onPointerCancel={() => setDragState(null)}
                  >
                    {index + 1}
                  </button>
                ))}

                {points.length < 4 && (
                  <div className="corner-editor-click-guide">
                    다음: {GUIDE_LABELS[points.length]}
                  </div>
                )}
              </div>
            </div>

            <PerspectivePreview
              photo={{
                ...photo,
                corners: points,
              }}
            />
          </div>

          <aside className="corner-editor-sidebar">
            <h3>선택 순서</h3>

            <ol>
              {GUIDE_LABELS.map((label, index) => (
                <li
                  key={label}
                  className={
                    points[index]
                      ? "corner-guide-complete"
                      : points.length === index
                        ? "corner-guide-current"
                        : ""
                  }
                >
                  {label}
                </li>
              ))}
            </ol>

            <div className="corner-coordinate-list">
              {points.map((point, index) => (
                <div key={index}>
                  <strong>{index + 1}</strong>
                  <span>
                    x {point.x.toFixed(3)} / y {point.y.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>

            <p className="corner-editor-tip">
              검은 여백이 아니라 사진 안에서 큐브 한 면의 바깥 테두리를
              선택하세요.
            </p>
          </aside>
        </div>

        <footer className="corner-editor-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
          >
            점 초기화
          </button>

          <div>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              취소
            </button>

            <button
              type="button"
              className="primary-button"
              disabled={points.length !== 4}
              onClick={handleSave}
            >
              네 점 저장
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}