import { CubieTargetPanel } from "../CubieTargetPanel";
import { SolverFaceletPanel } from "../SolverFaceletPanel";
import { TargetAssemblyPreview } from "../TargetAssemblyPreview";
import { TargetValidationPanel } from "../TargetValidationPanel";
import type { useCubeProject } from "../../store/useCubeProject";

type CubeProject = ReturnType<typeof useCubeProject>;

interface TargetValidationStepProps {
  cubeState: CubeProject["cubeState"];
  previewTargetFace: CubeProject["previewTargetFace"];
  targetValidationResult: CubeProject["targetValidationResult"];
  cubieTargetResult: CubeProject["cubieTargetResult"];
  solverFaceletResult: CubeProject["solverFaceletResult"];
  onSelectPreviewTargetFace: CubeProject["handleSelectPreviewTargetFace"];
  onSelectStickerFromPreview: CubeProject["handleSelectStickerFromPreview"];
}

export function TargetValidationStep({
  cubeState,
  previewTargetFace,
  targetValidationResult,
  cubieTargetResult,
  solverFaceletResult,
  onSelectPreviewTargetFace,
  onSelectStickerFromPreview,
}: TargetValidationStepProps) {
  return (
    <section className="workflow-content">
      <div className="workflow-section-heading">
        <div>
          <p className="eyebrow">Step 3</p>
          <h2>완성 이미지와 큐브 상태 검증</h2>
          <p>
            조립된 6면 이미지, 물리적 조각 배치, 표준 솔버 입력을 차례로
            확인하세요.
          </p>
        </div>
        <div className="workflow-progress-badge">
          {solverFaceletResult.isComplete ? "검증 완료" : "검증 필요"}
        </div>
      </div>
      <TargetAssemblyPreview
        cubeState={cubeState}
        selectedFace={previewTargetFace}
        onSelectFace={onSelectPreviewTargetFace}
        onSelectSticker={onSelectStickerFromPreview}
      />
      <TargetValidationPanel result={targetValidationResult} />
      <CubieTargetPanel result={cubieTargetResult} />
      <SolverFaceletPanel result={solverFaceletResult} />
    </section>
  );
}
