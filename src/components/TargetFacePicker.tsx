import { FACE_NAMES, type FaceName } from "../cube/types";
import { FACE_DESIGNS } from "../cube/constants";

interface TargetFacePickerProps {
  selectedFace: FaceName;
  counts: Record<FaceName, number>;
  onSelectFace: (face: FaceName) => void;
}

export function TargetFacePicker({
  selectedFace,
  counts,
  onSelectFace,
}: TargetFacePickerProps) {
  return (
    <section className="target-picker">
      <div className="target-picker-heading">
        <div>
          <p className="eyebrow">Target classification</p>
          <h2>조각이 속할 목표 면 선택</h2>
        </div>

        <p>
          목표 면을 선택한 뒤 전개도의 스티커를 클릭하세요. 한 면에는
          정확히 9개의 스티커가 들어가야 합니다.
        </p>
      </div>

      <div className="target-face-options">
        {FACE_NAMES.map((face) => {
          const design = FACE_DESIGNS[face];
          const count = counts[face];
          const isComplete = count === 9;
          const isOverflow = count > 9;

          return (
            <button
              key={face}
              type="button"
              className={[
                "target-face-button",
                selectedFace === face ? "target-face-button-selected" : "",
                isComplete ? "target-face-button-complete" : "",
                isOverflow ? "target-face-button-overflow" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectFace(face)}
            >
              <strong>{face}</strong>

              <span>{design.label}</span>

              <small>
                {count}/9
                {isComplete && " · 완료"}
                {isOverflow && " · 초과"}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}