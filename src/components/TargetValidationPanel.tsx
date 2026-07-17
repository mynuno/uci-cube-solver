import type { TargetValidationResult } from "../cube/targetValidation";

interface TargetValidationPanelProps {
  result: TargetValidationResult;
}

const MAX_VISIBLE_MESSAGES = 8;

export function TargetValidationPanel({
  result,
}: TargetValidationPanelProps) {
  const hiddenErrorCount = Math.max(
    0,
    result.errors.length - MAX_VISIBLE_MESSAGES,
  );

  const hiddenWarningCount = Math.max(
    0,
    result.warnings.length - MAX_VISIBLE_MESSAGES,
  );

  return (
    <section
      className={
        result.isComplete
          ? "target-validation target-validation-complete"
          : "target-validation"
      }
    >
      <div className="target-validation-heading">
        <div>
          <p className="eyebrow">Target validation</p>
          <h2>목표 설정 검사</h2>
          <p>
            목표 면, 위치, 회전이 모두 지정되었는지 검사합니다.
          </p>
        </div>

        <div
          className={
            result.isComplete
              ? "target-validation-count target-validation-count-complete"
              : "target-validation-count"
          }
        >
          {result.completedStickerCount}/54
        </div>
      </div>

      {result.isComplete ? (
        <div className="target-validation-success">
          54개 조각의 목표 면, 위치, 회전 설정이 모두 완료되었습니다.
        </div>
      ) : (
        <div className="target-validation-columns">
          <div className="target-validation-group">
            <h3>오류 {result.errors.length}개</h3>

            {result.errors.length === 0 ? (
              <p className="target-validation-empty">
                현재 구조적 오류는 없습니다.
              </p>
            ) : (
              <ul>
                {result.errors
                  .slice(0, MAX_VISIBLE_MESSAGES)
                  .map((error) => (
                    <li key={error}>{error}</li>
                  ))}
              </ul>
            )}

            {hiddenErrorCount > 0 && (
              <p className="target-validation-more">
                오류 {hiddenErrorCount}개가 더 있습니다.
              </p>
            )}
          </div>

          <div className="target-validation-group">
            <h3>미완성 조각 {result.warnings.length}개</h3>

            {result.warnings.length === 0 ? (
              <p className="target-validation-empty">
                미완성 조각이 없습니다.
              </p>
            ) : (
              <ul>
                {result.warnings
                  .slice(0, MAX_VISIBLE_MESSAGES)
                  .map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
              </ul>
            )}

            {hiddenWarningCount > 0 && (
              <p className="target-validation-more">
                미완성 조각 {hiddenWarningCount}개가 더 있습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}