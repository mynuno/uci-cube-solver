import { useMemo, useState } from "react";
import "./App.css";
import { CubeNet } from "./components/CubeNet/CubeNet";
import { ProjectControls } from "./components/ProjectControls";
import { StickerTargetEditor } from "./components/StickerTargetEditor";
import { TargetFacePicker } from "./components/TargetFacePicker";
import { FacePhotoUploader } from "./components/image/FacePhotoUploader";
import { CornerEditor } from "./components/image/CornerEditor";
import { createInitialCubeState, validateInitialCubeState } from "./cube/cube";
import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
} from "./cube/types";
import type { FacePhoto, NormalizedPoint } from "./image/types";
import { splitFacePhotoIntoStickerImages } from "./image/splitFace";
import { TargetAssemblyPreview } from "./components/TargetAssemblyPreview";
import { TargetValidationPanel } from "./components/TargetValidationPanel";
import { validateTargetAssignments } from "./cube/targetValidation";
import { CubieTargetPanel } from "./components/CubieTargetPanel";
import { inferCubieTargets } from "./cube/cubieTargets";
import { SolverFaceletPanel } from "./components/SolverFaceletPanel";
import { createSolverFacelets } from "./cube/solverFacelets";
import { CubeSolverPanel } from "./components/CubeSolverPanel";

type WorkflowStep = 1 | 2 | 3 | 4;

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

function cloneCubeState(state: CubeState): CubeState {
  return {
    ...state,

    stickers: Object.fromEntries(
      Object.entries(state.stickers).map(([id, sticker]) => [
        id,
        {
          ...sticker,
          currentPosition: {
            ...sticker.currentPosition,
          },
          targetPosition: sticker.targetPosition
            ? {
                ...sticker.targetPosition,
              }
            : null,
        },
      ]),
    ),

    cubies: Object.fromEntries(
      Object.entries(state.cubies).map(([id, cubie]) => [
        id,
        {
          ...cubie,
          stickerIds: [...cubie.stickerIds],
        },
      ]),
    ),

    faces: {
      U: state.faces.U.map((row) => [...row]),
      D: state.faces.D.map((row) => [...row]),
      F: state.faces.F.map((row) => [...row]),
      B: state.faces.B.map((row) => [...row]),
      L: state.faces.L.map((row) => [...row]),
      R: state.faces.R.map((row) => [...row]),
    } as CubeState["faces"],

    images: {
      ...state.images,
    },
  };
}

function createEmptyFaceCounts(): Record<FaceName, number> {
  return {
    U: 0,
    D: 0,
    F: 0,
    B: 0,
    L: 0,
    R: 0,
  };
}

function createTargetPositionKey(
  face: FaceName,
  position: GridPosition,
): string {
  return `${face}-${position.row}-${position.col}`;
}

function hasCompleteTargetAssignments(state: CubeState): boolean {
  return Object.values(state.stickers).every(
    (sticker) =>
      sticker.targetFace !== null &&
      sticker.targetPosition !== null &&
      sticker.targetRotation !== null,
  );
}

function App() {
  const [cubeState, setCubeState] = useState(createInitialCubeState);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);

  const [selectedTargetFace, setSelectedTargetFace] =
    useState<FaceName>("F");

  const [previewTargetFace, setPreviewTargetFace] =
    useState<FaceName>("F");

  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [facePhotos, setFacePhotos] = useState<
    Partial<Record<FaceName, FacePhoto>>
  >({});

  const [editingFace, setEditingFace] = useState<FaceName | null>(null);

  const validationErrors = validateInitialCubeState(cubeState);

  const targetFaceCounts = useMemo(() => {
    const counts = createEmptyFaceCounts();

    for (const sticker of Object.values(cubeState.stickers)) {
      if (sticker.targetFace) {
        counts[sticker.targetFace] += 1;
      }
    }

    return counts;
  }, [cubeState]);

  const targetPositionOwners = useMemo(() => {
    const owners: Record<string, string> = {};

    for (const sticker of Object.values(cubeState.stickers)) {
      if (!sticker.targetFace || !sticker.targetPosition) {
        continue;
      }

      owners[
        createTargetPositionKey(sticker.targetFace, sticker.targetPosition)
      ] = sticker.id;
    }

    return owners;
  }, [cubeState]);

  const targetValidationResult = useMemo(
    () => validateTargetAssignments(cubeState),
    [cubeState],
  );

  const cubieTargetResult = useMemo(
    () => inferCubieTargets(cubeState),
    [cubeState],
  );

  const solverFaceletResult = useMemo(
    () => createSolverFacelets(cubeState),
    [cubeState],
  );

  const processedFaceCount = useMemo(
    () =>
      FACE_NAMES.filter((face) =>
        cubeState.faces[face].every((row) =>
          row.every((stickerId) => {
            const sticker = cubeState.stickers[stickerId];

            return (
              sticker.imageId !== null &&
              cubeState.images[sticker.imageId] !== undefined
            );
          }),
        ),
      ).length,
    [cubeState],
  );

  const selectedSticker = selectedStickerId
    ? (cubeState.stickers[selectedStickerId] ?? null)
    : null;

  const selectedStickerImage =
    selectedSticker?.imageId && cubeState.images[selectedSticker.imageId]
      ? cubeState.images[selectedSticker.imageId]
      : undefined;

  const assignedCount = Object.values(targetFaceCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const allFacesComplete = FACE_NAMES.every(
    (face) => targetFaceCounts[face] === 9,
  );

  const allAssignmentsComplete = hasCompleteTargetAssignments(cubeState);

  function handleStickerClick(stickerId: string) {
    setSelectedStickerId(stickerId);
    setNotice(null);

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const sticker = nextState.stickers[stickerId];

      if (!sticker.targetFace) {
        sticker.targetFace = selectedTargetFace;
      }

      return nextState;
    });
  }

  function handleChangeStickerTargetFace(face: FaceName) {
    if (!selectedStickerId) {
      return;
    }

    setSelectedTargetFace(face);

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const sticker = nextState.stickers[selectedStickerId];

      sticker.targetFace = face;
      sticker.targetPosition = null;
      sticker.targetRotation = null;

      return nextState;
    });

    setNotice(null);
  }

  function handleChangeStickerTargetPosition(position: GridPosition) {
    if (!selectedStickerId) {
      return;
    }

    const sticker = cubeState.stickers[selectedStickerId];

    if (!sticker.targetFace) {
      setNotice({
        type: "error",
        message: "먼저 목표 면을 선택해야 합니다.",
      });
      return;
    }

    const key = createTargetPositionKey(sticker.targetFace, position);
    const ownerId = targetPositionOwners[key];

    if (ownerId && ownerId !== selectedStickerId) {
      setNotice({
        type: "error",
        message: `${sticker.targetFace}면 ${position.row + 1}행 ${
          position.col + 1
        }열에는 이미 다른 조각이 지정되어 있습니다.`,
      });
      return;
    }

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const nextSticker = nextState.stickers[selectedStickerId];

      nextSticker.targetPosition = {
        ...position,
      };

      return nextState;
    });

    setNotice(null);
  }

  function handleChangeStickerRotation(rotation: 0 | 90 | 180 | 270) {
    if (!selectedStickerId) {
      return;
    }

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const sticker = nextState.stickers[selectedStickerId];

      sticker.targetRotation = rotation;

      return nextState;
    });

    setNotice(null);
  }

  function handleClearStickerTarget() {
    if (!selectedStickerId) {
      return;
    }

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const sticker = nextState.stickers[selectedStickerId];

      sticker.targetFace = null;
      sticker.targetPosition = null;
      sticker.targetRotation = null;

      return nextState;
    });

    setNotice(null);
  }

  function handleReset() {
    setCubeState(createInitialCubeState());
    setSelectedStickerId(null);
    setSelectedTargetFace("F");
    setPreviewTargetFace("F");
    setCurrentStep(1);
    setNotice(null);
  }

  function handleLoadCubeState(loadedState: CubeState) {
    const loadedSolverResult = createSolverFacelets(loadedState);

    setCubeState(loadedState);
    setSelectedStickerId(null);
    setNotice(null);

    if (loadedSolverResult.isComplete) {
      setCurrentStep(4);
      return;
    }

    if (hasCompleteTargetAssignments(loadedState)) {
      setCurrentStep(3);
      return;
    }

    setCurrentStep(2);
  }

  function handleSelectFacePhoto(face: FaceName, file: File) {
    setFacePhotos((previousPhotos) => {
      const previousPhoto = previousPhotos[face];

      if (previousPhoto) {
        URL.revokeObjectURL(previousPhoto.previewUrl);
      }

      const nextPhoto: FacePhoto = {
        face,
        file,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        corners: [],
      };

      return {
        ...previousPhotos,
        [face]: nextPhoto,
      };
    });

    setNotice({
      type: "success",
      message: `${face}면 사진을 등록했습니다.`,
    });
  }

  function handleRemoveFacePhoto(face: FaceName) {
    setFacePhotos((previousPhotos) => {
      const photo = previousPhotos[face];

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      const nextPhotos = {
        ...previousPhotos,
      };

      delete nextPhotos[face];

      return nextPhotos;
    });

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);

      for (const row of nextState.faces[face]) {
        for (const stickerId of row) {
          const sticker = nextState.stickers[stickerId];

          if (sticker.imageId) {
            delete nextState.images[sticker.imageId];
            sticker.imageId = null;
          }
        }
      }

      return nextState;
    });

    if (editingFace === face) {
      setEditingFace(null);
    }

    setNotice({
      type: "success",
      message: `${face}면 사진과 생성된 9개 조각을 삭제했습니다.`,
    });
  }

  function handleEditCorners(face: FaceName) {
    if (!facePhotos[face]) {
      return;
    }

    setEditingFace(face);
  }

  async function handleSaveCorners(
    face: FaceName,
    corners: NormalizedPoint[],
  ) {
    const currentPhoto = facePhotos[face];

    if (!currentPhoto) {
      setNotice({
        type: "error",
        message: `${face}면 사진을 찾지 못했습니다.`,
      });
      return;
    }

    const updatedPhoto: FacePhoto = {
      ...currentPhoto,
      corners: corners.map((point) => ({
        ...point,
      })),
    };

    try {
      const generatedImages =
        await splitFacePhotoIntoStickerImages(updatedPhoto);

      setFacePhotos((previousPhotos) => ({
        ...previousPhotos,
        [face]: updatedPhoto,
      }));

      setCubeState((previousState) => {
        const nextState = cloneCubeState(previousState);

        for (const generated of generatedImages) {
          const { row, col } = generated.position;
          const stickerId = nextState.faces[face][row][col];
          const sticker = nextState.stickers[stickerId];

          nextState.images[generated.image.id] = generated.image;
          sticker.imageId = generated.image.id;
        }

        return nextState;
      });

      setEditingFace(null);

      setNotice({
        type: "success",
        message: `${face}면을 보정하고 9개 조각으로 분할했습니다.`,
      });
    } catch (error) {
      console.error("Face splitting failed:", error);

      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `${face}면 조각 이미지를 만들지 못했습니다.`,
      });
    }
  }

  function moveToPreviousStep() {
    setCurrentStep((previousStep) =>
      Math.max(1, previousStep - 1) as WorkflowStep,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function moveToNextStep() {
    setCurrentStep((previousStep) =>
      Math.min(4, previousStep + 1) as WorkflowStep,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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
              onClick={() => setCurrentStep(stepDefinition.step)}
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
                onClick={() => setNotice(null)}
              >
                ×
              </button>
            </div>
          )}

          <ProjectControls
            cubeState={cubeState}
            onLoadCubeState={handleLoadCubeState}
            onLoadSuccess={(message) =>
              setNotice({
                type: "success",
                message,
              })
            }
            onLoadError={(message) =>
              setNotice({
                type: "error",
                message,
              })
            }
          />

          {currentStep === 1 && (
            <section className="workflow-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h2>6면 사진 등록 및 보정</h2>
                  <p>
                    각 면의 사진을 등록한 뒤 네 모서리를 지정하면
                    9개 스티커 이미지로 자동 분할됩니다.
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
                onSelectFace={setSelectedTargetFace}
              />

              <div className="classification-layout">
                <CubeNet
                  cubeState={cubeState}
                  selectedStickerId={selectedStickerId}
                  onStickerClick={handleStickerClick}
                />

                <StickerTargetEditor
                  sticker={selectedSticker}
                  image={selectedStickerImage}
                  positionOwners={targetPositionOwners}
                  onChangeTargetFace={handleChangeStickerTargetFace}
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
                    조립된 6면 이미지, 물리적 조각 배치, 표준 솔버
                    입력을 차례로 확인하세요.
                  </p>
                </div>

                <div className="workflow-progress-badge">
                  {solverFaceletResult.isComplete ? "검증 완료" : "검증 필요"}
                </div>
              </div>

              <TargetAssemblyPreview
                cubeState={cubeState}
                selectedFace={previewTargetFace}
                onSelectFace={setPreviewTargetFace}
                onSelectSticker={(stickerId) => {
                  setSelectedStickerId(stickerId);
                  setCurrentStep(2);
                  setNotice(null);
                }}
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
          onClose={() => setEditingFace(null)}
          onSave={handleSaveCorners}
        />
      )}
    </main>
  );
}

export default App;