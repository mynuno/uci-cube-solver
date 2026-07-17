import type { CubieTargetResult } from "../cube/cubieTargets";

interface CubieTargetPanelProps {
  result: CubieTargetResult;
}

const MAX_VISIBLE_ITEMS = 10;

export function CubieTargetPanel({
  result,
}: CubieTargetPanelProps) {
  return (
    <section
      className={
        result.isComplete
          ? "cubie-target-panel cubie-target-panel-complete"
          : "cubie-target-panel"
      }
    >
      <div className="cubie-target-heading">
        <div>
          <p className="eyebrow">Cubie targets</p>
          <h2>물리 조각 목표 계산</h2>
          <p>
            같은 물리 조각에 붙은 스티커들을 묶어 목표 Cubie
            자리를 계산합니다.
          </p>
        </div>

        <div
          className={
            result.isComplete
              ? "cubie-target-count cubie-target-count-complete"
              : "cubie-target-count"
          }
        >
          {result.mappedCount}/26
        </div>
      </div>

      <div className="cubie-target-type-counts">
        <span>센터 {result.typeCounts.center}/6</span>
        <span>엣지 {result.typeCounts.edge}/12</span>
        <span>코너 {result.typeCounts.corner}/8</span>
      </div>

      {result.isComplete ? (
        <div className="cubie-target-success">
          26개 물리 조각의 목표 자리가 모두 확인되었습니다.
        </div>
      ) : (
        <div className="cubie-target-columns">
          <div className="cubie-target-group">
            <h3>계산 오류 {result.errors.length}개</h3>

            {result.errors.length === 0 ? (
              <p>현재 발견된 구조적 오류가 없습니다.</p>
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

          <div className="cubie-target-group">
            <h3>
              미완성 Cubie {result.incompleteCubieIds.length}개
            </h3>

            {result.incompleteCubieIds.length === 0 ? (
              <p>미완성 Cubie가 없습니다.</p>
            ) : (
              <ul>
                {result.incompleteCubieIds
                  .slice(0, MAX_VISIBLE_ITEMS)
                  .map((cubieId) => (
                    <li key={cubieId}>{cubieId}</li>
                  ))}
              </ul>
            )}

            {result.incompleteCubieIds.length >
              MAX_VISIBLE_ITEMS && (
              <p>
                {result.incompleteCubieIds.length -
                  MAX_VISIBLE_ITEMS}
                개가 더 있습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {result.assignments.length > 0 && (
        <div className="cubie-target-mappings">
          <h3>확인된 목표 자리</h3>

          <div className="cubie-target-mapping-list">
            {result.assignments
              .slice(0, MAX_VISIBLE_ITEMS)
              .map((assignment) => (
                <div key={assignment.currentCubieId}>
                  <span>{assignment.currentCubieId}</span>
                  <strong>→</strong>
                  <span>{assignment.targetCubieId}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}