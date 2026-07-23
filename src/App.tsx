import "./App.css";
import "./stickerClassificationFix.css";

import { CubeNet } from "./components/CubeNet/CubeNet";
import { CubeSolverPanel } from "./components/CubeSolverPanel";
import { CubieTargetPanel } from "./components/CubieTargetPanel";
import { ProjectControls } from "./components/ProjectControls";
import { SolverFaceletPanel } from "./components/SolverFaceletPanel";
import { StickerTargetEditor } from "./components/StickerTargetEditor";
import { TargetAssemblyPreview } from "./components/TargetAssemblyPreview";
import { TargetFacePicker } from "./components/TargetFacePicker";
import { TargetValidationPanel } from "./components/TargetValidationPanel";
import { CornerEditor } from "./components/image/CornerEditor";
import { FacePhotoUploader } from "./components/image/FacePhotoUploader";
import {
  useCubeProject,
  type WorkflowStep,
} from "./store/useCubeProject";

interface WorkflowStepDefinition {
  step: WorkflowStep;
  title: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  {
    step: 1,
    title: "사진 등록",
    description: "6면 사진 보정 및 분할",
  },
  {
    step: 2,
    title: "조각 분류",
    description: "목표 면·위치·회전 지정",
  },
  {
    step: 3,
    title: "완성 검증",
    description: "이미지와 큐브 상태 확인",
  },
  {
    step: 4,
    title: "풀이 안내",
    description: "해답 생성 및 단계별 회전",
  },
];

function App() {
  const {
    cubeState,
    currentStep,
    selectedTargetFace,
    previewTargetFace,
    selectedStickerId,
    notice,
    facePhotos,
    editingFace,
    validationErrors,
    targetFaceCounts,
    targetPositionOwners,
    targetValidationResult,
    cubieTargetResult,
    solverFaceletResult,
    processedFaceCount,
    selectedSticker,
    selectedStickerImage,
    assignedCount,
    allFacesComplete,
    allAssignmentsComplete,
    handleSelectWorkflowStep,
    handleDismissNotice,
    handleLoadSuccess,
    handleLoadError,
    handleSelectTargetFace,
    handleSelectPreviewTargetFace,
    handleStickerClick,
    handleChangeStickerTargetPosition,
    handleChangeStickerRotation,
    handleClearStickerTarget,
    handleSelectStickerFromPreview,
    handleReset,
    handleLoadCubeState,
    handleSelectFacePhoto,
    handleRemoveFacePhoto,
    handleEditCorners,
    handleCloseCornerEditor,
    handleSaveCorners,
    moveToPreviousStep,
    moveToNextStep,
  } = useCubeProject();

  const currentStepDefinition =
    WORKFLOW_STEPS.find((step) => step.step === currentStep) ??
    WORKFLOW_STEPS[0];

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">UCI Cube Solver</p>
        <h1>{currentStepDefinition.title}</h1>
        <p>{currentStepDefinition.description}</p>
      </header>

      <nav className="workflow-navigation" aria-label="큐브 풀이 진행 단계">
        {WORKFLOW_STEPS.map((stepDefinition) => {
          const isCurrent = stepDefinition.step === currentStep;
          const isCompleted = stepDefinition.step < currentStep;

          return (
            <button
              key={stepDefinition.step}
              type="button"
              className={[
                "workflow-step",
                isCurrent ? "workflow-step-current" : "",
                isCompleted ? "workflow-step-completed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelectWorkflowStep(stepDefinition.step)}
            >
              <span className="workflow-step-number">
                {isCompleted ? "✓" : stepDefinition.step}
              </span>
              <span className="workflow-step-text">
                <strong>{stepDefinition.title}</strong>
                <small>{stepDefinition.description}</small>
              </span>
            </button>
          );
        })}
      </nav>

      {validationErrors.length > 0 ? (
        <section className="validation-error">
          <h2>큐브 데이터 오류</h2>
          <ul>
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <div className="status-row">
            <div
              className={
                allFacesComplete
                  ? "validation-success"
                  : "validation-progress"
              }
            >
              {allFacesComplete
                ? "조각 분류 완료: 모든 면에 9개씩 지정되었습니다."
                : `분류 진행 중: ${assignedCount}/54`}
            </div>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              전체 작업 초기화
            </button>
          </div>

          {notice && (
            <div
              className={
                notice.type === "success"
                  ? "notice-message notice-message-success"
                  : "notice-message notice-message-error"
              }
            >
              <span>{notice.message}</span>
              <button
                type="button"
                aria-label="알림 닫기"
                onClick={handleDismissNotice}
              >
                ×
              </button>
            </div>
          )}

          <ProjectControls
            cubeState={cubeState}
            onLoadCubeState={handleLoadCubeState}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
          />

          {currentStep === 1 && (
            <section className="workflow-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h2>6면 사진 등록 및 보정</h2>
                  <p>
                    각 면의 사진을 등록한 뒤 네 모서리를 지정하면 9개
                    스티커 이미지로 자동 분할됩니다.
                  </p>
                </div>
                <div className="workflow-progress-badge">
                  {processedFaceCount}/6면 처리
                </div>
              </div>

              <FacePhotoUploader
                facePhotos={facePhotos}
                onSelectPhoto={handleSelectFacePhoto}
                onRemovePhoto={handleRemoveFacePhoto}
                onEditCorners={handleEditCorners}
              />

              <div className="workflow-tip">
                JSON 테스트 파일을 불러온 경우 사진 등록 없이 바로 다음
                단계로 이동해도 됩니다.
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="workflow-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="eyebrow">Step 2</p>
                  <h2>54개 조각 목표 지정</h2>
                  <p>
                    현재 큐브의 조각을 선택하고, 완성 상태에서 들어갈
                    면·위치·회전 방향을 지정하세요.
                  </p>
                </div>
                <div className="workflow-progress-badge">
                  {assignedCount}/54개 분류
                </div>
              </div>

              <TargetFacePicker
                selectedFace={selectedTargetFace}
                counts={targetFaceCounts}
                onSelectFace={handleSelectTargetFace}
              />

              <div className="classification-layout">
                <CubeNet
                  cubeState={cubeState}
                  selectedStickerId={selectedStickerId}
                  onStickerClick={handleStickerClick}
                />

                <StickerTargetEditor
                  cubeState={cubeState}
                  sticker={selectedSticker}
                  image={selectedStickerImage}
                  previewFace={selectedTargetFace}
                  positionOwners={targetPositionOwners}
                  onSelectTargetFace={handleSelectTargetFace}
                  onChangeTargetPosition={handleChangeStickerTargetPosition}
                  onChangeRotation={handleChangeStickerRotation}
                  onClear={handleClearStickerTarget}
                />
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="workflow-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="eyebrow">Step 3</p>
                  <h2>완성 이미지와 큐브 상태 검증</h2>
                  <p>
                    조립된 6면 이미지, 물리적 조각 배치, 표준 솔버 입력을
                    차례로 확인하세요.
                  </p>
                </div>
                <div className="workflow-progress-badge">
                  {solverFaceletResult.isComplete ? "검증 완료" : "검증 필요"}
                </div>
              </div>

              <TargetAssemblyPreview
                cubeState={cubeState}
                selectedFace={previewTargetFace}
                onSelectFace={handleSelectPreviewTargetFace}
                onSelectSticker={handleSelectStickerFromPreview}
              />

              <TargetValidationPanel result={targetValidationResult} />
              <CubieTargetPanel result={cubieTargetResult} />
              <SolverFaceletPanel result={solverFaceletResult} />
            </section>
          )}

          {currentStep === 4 && (
            <section className="workflow-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="eyebrow">Step 4</p>
                  <h2>풀이 생성 및 단계별 안내</h2>
                  <p>
                    표준 facelet 입력으로 풀이를 계산하고 한 동작씩
                    따라가세요.
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
          )}

          <div className="workflow-footer-navigation">
            <button
              type="button"
              className="secondary-button"
              disabled={currentStep === 1}
              onClick={moveToPreviousStep}
            >
              ← 이전 단계
            </button>

            <span>
              {currentStep} / {WORKFLOW_STEPS.length}
            </span>

            <button
              type="button"
              className="primary-button"
              disabled={
                currentStep === 4 ||
                (currentStep === 2 && !allAssignmentsComplete) ||
                (currentStep === 3 && !solverFaceletResult.isComplete)
              }
              onClick={moveToNextStep}
            >
              다음 단계 →
            </button>
          </div>
        </>
      )}

      {editingFace && facePhotos[editingFace] && (
        <CornerEditor
          face={editingFace}
          photo={facePhotos[editingFace]}
          onClose={handleCloseCornerEditor}
          onSave={handleSaveCorners}
        />
      )}
    </main>
  );
}

export default App;
