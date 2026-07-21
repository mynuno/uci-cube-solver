import { useState } from "react";
import type { SolverFaceletResult } from "../cube/solverFacelets";
import {
  solveFaceletString,
  type CubeSolutionResult,
} from "../cube/solveCube";

interface CubeSolverPanelProps {
  faceletResult: SolverFaceletResult;
}

type SolverStatus =
  | "idle"
  | "initializing"
  | "success"
  | "error";

function describeMove(move: string): string {
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
    return `${faceLabel} 180°`;
  }

  if (suffix === "'") {
    return `${faceLabel} 반시계 방향 90°`;
  }

  return `${faceLabel} 시계 방향 90°`;
}

export function CubeSolverPanel({
  faceletResult,
}: CubeSolverPanelProps) {
  const [status, setStatus] = useState<SolverStatus>("idle");
  const [result, setResult] =
    useState<CubeSolutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  async function handleSolve() {
    if (!faceletResult.facelets) {
      setErrorMessage(
        "먼저 54개 조각의 목표 면 설정을 완료해야 합니다.",
      );
      setStatus("error");
      return;
    }

    setStatus("initializing");
    setResult(null);
    setErrorMessage(null);

    try {
      const nextResult = await solveFaceletString(
        faceletResult.facelets,
      );

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

  const solvingUnavailable = !faceletResult.isComplete;

  return (
    <section className="cube-solver-panel">
      <div className="cube-solver-heading">
        <div>
          <p className="eyebrow">Cube solver</p>
          <h2>큐브 풀이 생성</h2>
          <p>
            완성된 facelet 입력을 바탕으로 실제 회전 수순을
            계산합니다.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          disabled={
            solvingUnavailable || status === "initializing"
          }
          onClick={handleSolve}
        >
          {status === "initializing"
            ? "솔버 준비 및 계산 중..."
            : "풀이 계산"}
        </button>
      </div>

      {solvingUnavailable && (
        <div className="cube-solver-blocked">
          목표 면 분류를 모두 완료하고 솔버 입력 검사를 통과해야
          풀이를 계산할 수 있습니다.
        </div>
      )}

      {status === "initializing" && (
        <div className="cube-solver-loading">
          최초 실행은 탐색 테이블을 준비하므로 몇 초 걸릴 수
          있습니다. 이 동안 화면이 잠시 멈출 수도 있습니다.
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="cube-solver-error">
          {errorMessage}
        </div>
      )}

      {status === "success" && result && (
        <>
          <div className="cube-solver-success">
            풀이 수순을 생성했습니다. 총 {result.moveCount}회
            이동입니다.
          </div>

          {result.moveCount === 0 ? (
            <div className="cube-solver-solved">
              현재 큐브가 이미 일반 3×3 기준으로 해결된
              상태입니다.
            </div>
          ) : (
            <>
              <div className="cube-solver-notation">
                <strong>표준 회전 기호</strong>
                <code>{result.solution}</code>
              </div>

              <div className="cube-solver-move-list">
                {result.moves.map((move, index) => (
                  <div
                    key={`${move}-${index}`}
                    className="cube-solver-move"
                  >
                    <span>{index + 1}</span>

                    <strong>{move}</strong>

                    <p>{describeMove(move)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}