import "./App.css";
import "./stickerClassificationFix.css";
import { ProjectControls } from "./components/ProjectControls";
import { CornerEditor } from "./components/image/CornerEditor";
import { PhotoRegistrationStep } from "./components/workflow/PhotoRegistrationStep";
import { SolverGuideStep } from "./components/workflow/SolverGuideStep";
import { StickerClassificationStep } from "./components/workflow/StickerClassificationStep";
import { TargetValidationStep } from "./components/workflow/TargetValidationStep";
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
            <PhotoRegistrationStep
              facePhotos={facePhotos}
              processedFaceCount={processedFaceCount}
              onSelectFacePhoto={handleSelectFacePhoto}
              onRemoveFacePhoto={handleRemoveFacePhoto}
              onEditCorners={handleEditCorners}
            />
          )}

          {currentStep === 2 && (
            <StickerClassificationStep
              cubeState={cubeState}
              selectedTargetFace={selectedTargetFace}
              selectedStickerId={selectedStickerId}
              targetFaceCounts={targetFaceCounts}
              targetPositionOwners={targetPositionOwners}
              selectedSticker={selectedSticker}
              selectedStickerImage={selectedStickerImage}
              assignedCount={assignedCount}
              onSelectTargetFace={handleSelectTargetFace}
              onStickerClick={handleStickerClick}
              onChangeStickerTargetPosition={
                handleChangeStickerTargetPosition
              }
              onChangeStickerRotation={handleChangeStickerRotation}
              onClearStickerTarget={handleClearStickerTarget}
            />
          )}

          {currentStep === 3 && (
            <TargetValidationStep
              cubeState={cubeState}
              previewTargetFace={previewTargetFace}
              targetValidationResult={targetValidationResult}
              cubieTargetResult={cubieTargetResult}
              solverFaceletResult={solverFaceletResult}
              onSelectPreviewTargetFace={handleSelectPreviewTargetFace}
              onSelectStickerFromPreview={handleSelectStickerFromPreview}
            />
          )}

          {currentStep === 4 && (
            <SolverGuideStep solverFaceletResult={solverFaceletResult} />
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
