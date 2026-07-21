import type { SolverFaceletResult } from "../cube/solverFacelets";

interface SolverFaceletPanelProps {
  result: SolverFaceletResult;
}

const MAX_VISIBLE_ITEMS = 8;

export function SolverFaceletPanel({
  result,
}: SolverFaceletPanelProps) {
  return (
    <section
      className={
        result.isComplete
          ? "solver-facelet-panel solver-facelet-panel-complete"
          : "solver-facelet-panel"
      }
    >
      <div className="solver-facelet-heading">
        <div>
          <p className="eyebrow">Solver facelets</p>
          <h2>솔버 입력 변환</h2>
          <p>
            현재 전개도를 표준 URFDLB 순서의 54개
            facelet 문자열로 변환합니다.
          </p>
        </div>

        <div
          className={
            result.isComplete
              ? "solver-facelet-status solver-facelet-status-complete"
              : "solver-facelet-status"
          }
        >
          {result.isComplete ? "준비 완료" : "미완성"}
        </div>
      </div>

      <div className="solver-facelet-counts">
        <span>U {result.faceCounts.U}/9</span>
        <span>R {result.faceCounts.R}/9</span>
        <span>F {result.faceCounts.F}/9</span>
        <span>D {result.faceCounts.D}/9</span>
        <span>L {result.faceCounts.L}/9</span>
        <span>B {result.faceCounts.B}/9</span>
      </div>

      {result.isComplete && result.facelets ? (
        <>
          <div className="solver-facelet-success">
            표준 솔버 입력 문자열을 생성했습니다.
          </div>

          <div className="solver-facelet-output">
            <strong>URFDLB facelets</strong>
            <code>{result.facelets}</code>
          </div>
        </>
      ) : (
        <div className="solver-facelet-columns">
          <div className="solver-facelet-group">
            <h3>변환 오류 {result.errors.length}개</h3>

            {result.errors.length === 0 ? (
              <p>현재 구조적 오류는 없습니다.</p>
            ) : (
              <ul>
                {result.errors
                  .slice(0, MAX_VISIBLE_ITEMS)
                  .map((error) => (
                    <li key={error}>{error}</li>
                  ))}
              </ul>
            )}
          </div>

          <div className="solver-facelet-group">
            <h3>
              목표 면 미지정{" "}
              {result.missingStickerIds.length}개
            </h3>

            {result.missingStickerIds.length === 0 ? (
              <p>목표 면이 빠진 스티커가 없습니다.</p>
            ) : (
              <ul>
                {result.missingStickerIds
                  .slice(0, MAX_VISIBLE_ITEMS)
                  .map((stickerId) => (
                    <li key={stickerId}>
                      {stickerId}
                    </li>
                  ))}
              </ul>
            )}

            {result.missingStickerIds.length >
              MAX_VISIBLE_ITEMS && (
              <p className="solver-facelet-more">
                {result.missingStickerIds.length -
                  MAX_VISIBLE_ITEMS}
                개가 더 있습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}