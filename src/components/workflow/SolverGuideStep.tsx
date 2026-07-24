import { CubeSolverPanel } from "../CubeSolverPanel";
import type { useCubeProject } from "../../store/useCubeProject";

type CubeProject = ReturnType<typeof useCubeProject>;

interface SolverGuideStepProps {
  solverFaceletResult: CubeProject["solverFaceletResult"];
}

export function SolverGuideStep({
  solverFaceletResult,
}: SolverGuideStepProps) {
  return (
    <section className="workflow-content">
      <div className="workflow-section-heading">
        <div>
          <p className="eyebrow">Step 4</p>
          <h2>풀이 생성 및 단계별 안내</h2>
          <p>
            표준 facelet 입력으로 풀이를 계산하고 한 동작씩 따라가세요.
          </p>
        </div>
        <div className="workflow-progress-badge">
          {solverFaceletResult.isComplete ? "풀이 가능" : "입력 미완성"}
        </div>
      </div>
      <CubeSolverPanel
        key={solverFaceletResult.facelets ?? "incomplete"}
        faceletResult={solverFaceletResult}
      />
    </section>
  );
}
