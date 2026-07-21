import { useState } from "react";
import type { SolverFaceletResult } from "../cube/solverFacelets";
import { solveFaceletString, type CubeSolutionResult } from "../cube/solveCube";

interface CubeSolverPanelProps {
  faceletResult: SolverFaceletResult;
}

type SolverStatus = "idle" | "initializing" | "success" | "error";

interface MoveDescription {
  faceLabel: string;
  directionLabel: string;
  symbol: string;
}

function describeMove(move: string): MoveDescription {
  const face = move.charAt(0);
  const suffix = move.slice(1);

  const faceLabels: Record<string, string> = {
    U: "윗면",
    R: "오른쪽 면",
    F: "앞면",
    D: "아랫면",
    L: "왼쪽 면",
    B: "뒷면",
  };

  const faceLabel = faceLabels[face] ?? face;

  if (suffix === "2") {
    return {
      faceLabel,
      directionLabel: "180° 회전",
      symbol: "↻↻",
    };
  }

  if (suffix === "'") {
    return {
      faceLabel,
      directionLabel: "반시계 방향으로 90°",
      symbol: "↺",
    };
  }

  return {
    faceLabel,
    directionLabel: "시계 방향으로 90°",
    symbol: "↻",
  };
}

export function CubeSolverPanel({ faceletResult }: CubeSolverPanelProps) {
  const [status, setStatus] = useState<SolverStatus>("idle");
  const [result, setResult] = useState<CubeSolutionResult | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  async function handleSolve() {
    if (!faceletResult.facelets) {
      setErrorMessage("먼저 54개 조각의 목표 면 설정을 완료해야 합니다.");
      setStatus("error");
      return;
    }

    setStatus("initializing");
    setResult(null);
    setErrorMessage(null);
    setCurrentMoveIndex(0);

    try {
      const nextResult = await solveFaceletString(faceletResult.facelets);

      setResult(nextResult);
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "큐브 풀이 중 알 수 없는 오류가 발생했습니다.",
      );

      setStatus("error");
    }
  }

  function handlePreviousMove() {
    setCurrentMoveIndex((previousIndex) => Math.max(0, previousIndex - 1));
  }

  function handleNextMove() {
    if (!result) {
      return;
    }

    setCurrentMoveIndex((previousIndex) =>
      Math.min(result.moves.length - 1, previousIndex + 1),
    );
  }

  function handleRestartGuide() {
    setCurrentMoveIndex(0);
  }

  const solvingUnavailable = !faceletResult.isComplete;

  const currentMove =
    result && result.moves.length > 0 ? result.moves[currentMoveIndex] : null;

  const currentMoveDescription = currentMove ? describeMove(currentMove) : null;

  const isFirstMove = currentMoveIndex === 0;

  const isLastMove =
    Boolean(result) && currentMoveIndex === (result?.moves.length ?? 0) - 1;

  const progressPercentage =
    result && result.moves.length > 0
      ? ((currentMoveIndex + 1) / result.moves.length) * 100
      : 0;

  return (
    <section className="cube-solver-panel">
      <div className="cube-solver-heading">
        <div>
          <p className="eyebrow">Cube solver</p>
          <h2>큐브 풀이 생성</h2>
          <p>
            완성된 facelet 입력을 바탕으로 실제 회전 수순을 계산하고 한 단계씩
            안내합니다.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          disabled={solvingUnavailable || status === "initializing"}
          onClick={handleSolve}
        >
          {status === "initializing"
            ? "솔버 준비 및 계산 중..."
            : result
              ? "풀이 다시 계산"
              : "풀이 계산"}
        </button>
      </div>

      {solvingUnavailable && (
        <div className="cube-solver-blocked">
          목표 면 분류를 모두 완료하고 솔버 입력 검사를 통과해야 풀이를 계산할
          수 있습니다.
        </div>
      )}

      {status === "initializing" && (
        <div className="cube-solver-loading">
          최초 실행은 탐색 테이블을 준비하므로 몇 초 걸릴 수 있습니다. 이 동안
          화면이 잠시 멈출 수 있습니다.
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="cube-solver-error">{errorMessage}</div>
      )}

      {status === "success" && result && (
        <>
          <div className="cube-solver-success">
            풀이 수순을 생성했습니다. 총 {result.moveCount}회 이동입니다.
          </div>

          {result.moveCount === 0 ? (
            <div className="cube-solver-solved">
              현재 큐브가 이미 일반 3×3 기준으로 해결된 상태입니다.
            </div>
          ) : (
            <>
              <div className="solution-guide">
                <div className="solution-guide-progress-heading">
                  <strong>
                    단계 {currentMoveIndex + 1} / {result.moves.length}
                  </strong>

                  <span>{Math.round(progressPercentage)}%</span>
                </div>

                <div className="solution-guide-progress-track">
                  <div
                    className="solution-guide-progress-value"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>

                {currentMove && currentMoveDescription && (
                  <div className="solution-current-move">
                    <div className="solution-current-move-symbol">
                      {currentMoveDescription.symbol}
                    </div>

                    <div className="solution-current-move-content">
                      <span>현재 동작</span>

                      <strong>{currentMove}</strong>

                      <h3>{currentMoveDescription.faceLabel}</h3>

                      <p>{currentMoveDescription.directionLabel}</p>
                    </div>
                  </div>
                )}

                <div className="solution-guide-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isFirstMove}
                    onClick={handlePreviousMove}
                  >
                    ← 이전 동작
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleRestartGuide}
                  >
                    처음부터
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={isLastMove}
                    onClick={handleNextMove}
                  >
                    다음 동작 →
                  </button>
                </div>

                {isLastMove && (
                  <div className="solution-guide-finished">
                    마지막 동작입니다. 이 회전을 마치면 일반 3×3 기준 풀이가
                    완료됩니다.
                  </div>
                )}
              </div>

              <details className="cube-solver-details">
                <summary>전체 수순 및 표준 회전 기호 보기</summary>

                <div className="cube-solver-notation">
                  <strong>표준 회전 기호</strong>
                  <code>{result.solution}</code>
                </div>

                <div className="cube-solver-move-list">
                  {result.moves.map((move, index) => {
                    const description = describeMove(move);

                    return (
                      <button
                        key={`${move}-${index}`}
                        type="button"
                        className={
                          index === currentMoveIndex
                            ? "cube-solver-move cube-solver-move-current"
                            : "cube-solver-move"
                        }
                        onClick={() => setCurrentMoveIndex(index)}
                      >
                        <span>{index + 1}</span>

                        <strong>{move}</strong>

                        <p>
                          {description.faceLabel}, {description.directionLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </details>
            </>
          )}
        </>
      )}
    </section>
  );
}
