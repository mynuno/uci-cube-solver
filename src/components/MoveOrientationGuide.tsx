interface MoveOrientationGuideProps {
  move: string;
}

const FACE_LABELS: Record<string, string> = {
  U: "윗면",
  D: "아랫면",
  F: "앞면",
  B: "뒷면",
  L: "왼쪽 면",
  R: "오른쪽 면",
};

function getDirection(move: string) {
  const suffix = move.slice(1);

  if (suffix === "2") {
    return {
      symbol: "↻↻",
      label: "180° 회전",
    };
  }

  if (suffix === "'") {
    return {
      symbol: "↺",
      label: "반시계 방향 90°",
    };
  }

  return {
    symbol: "↻",
    label: "시계 방향 90°",
  };
}

export function MoveOrientationGuide({
  move,
}: MoveOrientationGuideProps) {
  const face = move.charAt(0);
  const direction = getDirection(move);
  const faceLabel = FACE_LABELS[face] ?? face;

  const faces = ["U", "L", "F", "R", "B", "D"];

  return (
    <div className="move-orientation-guide">
      <div className="move-orientation-instructions">
        <p className="eyebrow">Holding position</p>

        <h3>큐브 기준 자세</h3>

        <p>
          <strong>F면을 정면</strong>으로 보고,
          <strong> U면이 위쪽</strong>을 향하도록 큐브를 잡으세요.
        </p>

        <div className="move-orientation-current">
          <span>이번에 돌릴 면</span>
          <strong>
            {face} · {faceLabel}
          </strong>
          <p>
            이 면을 직접 정면에서 바라본 기준으로{" "}
            {direction.label}
          </p>
        </div>
      </div>

      <div className="move-orientation-net">
        {faces.map((netFace) => (
          <div
            key={netFace}
            className={[
              "move-orientation-face",
              `move-orientation-face-${netFace}`,
              netFace === face
                ? "move-orientation-face-active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <strong>{netFace}</strong>

            {netFace === face && (
              <span className="move-orientation-arrow">
                {direction.symbol}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="move-orientation-warning">
        시계 방향은 화면에 보이는 전개도 기준이 아니라,
        <strong> 해당 면을 정면에서 바라본 기준</strong>입니다.
      </div>
    </div>
  );
}