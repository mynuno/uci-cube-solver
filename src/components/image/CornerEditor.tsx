import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { FaceName } from "../../cube/types";
import type { FacePhoto, NormalizedPoint } from "../../image/types";

interface CornerEditorProps {
  face: FaceName;
  photo: FacePhoto;
  onClose: () => void;
  onSave: (face: FaceName, corners: NormalizedPoint[]) => void;
}

interface DragState {
  pointIndex: number;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getNormalizedPoint(
  event: ReactPointerEvent<HTMLDivElement>,
): NormalizedPoint {
  const rect = event.currentTarget.getBoundingClientRect();

  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height),
  };
}

export function CornerEditor({
  face,
  photo,
  onClose,
  onSave,
}: CornerEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

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

  function handleEditorPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (points.length >= 4) {
      return;
    }

    setPoints((previousPoints) => [
      ...previousPoints,
      getNormalizedPoint(event),
    ]);
  }

  function handlePointPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    pointIndex: number,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    setDragState({
      pointIndex,
    });
  }

  function handlePointPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (!dragState || !editorRef.current) {
      return;
    }

    const rect = editorRef.current.getBoundingClientRect();

    const nextPoint: NormalizedPoint = {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    };

    setPoints((previousPoints) =>
      previousPoints.map((point, index) =>
        index === dragState.pointIndex ? nextPoint : point,
      ),
    );
  }

  function handlePointPointerUp(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.currentTarget.releasePointerCapture(event.pointerId);
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

  const guideLabels = [
    "1. 좌측 위",
    "2. 우측 위",
    "3. 우측 아래",
    "4. 좌측 아래",
  ];

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
          큐브 면의 바깥 테두리를 기준으로 좌측 위부터 시계 방향으로
          네 점을 선택하세요. 선택한 점은 드래그해서 수정할 수 있습니다.
        </p>

        <div className="corner-editor-layout">
          <div
            ref={editorRef}
            className="corner-editor-image"
            onPointerDown={handleEditorPointerDown}
          >
            <img
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
                다음: {guideLabels[points.length]}
              </div>
            )}
          </div>

          <aside className="corner-editor-sidebar">
            <h3>선택 순서</h3>

            <ol>
              {guideLabels.map((label, index) => (
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