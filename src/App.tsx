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

function App() {
  const [cubeState, setCubeState] = useState(createInitialCubeState);

  const [selectedTargetFace, setSelectedTargetFace] = useState<FaceName>("F");

  const [previewTargetFace, setPreviewTargetFace] = useState<FaceName>("F");

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
    setNotice(null);
  }

  function handleLoadCubeState(loadedState: CubeState) {
    setCubeState(loadedState);
    setSelectedStickerId(null);
    setNotice(null);
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

  async function handleSaveCorners(face: FaceName, corners: NormalizedPoint[]) {
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

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">UCI Cube Solver</p>

        <h1>큐브 조각 분류</h1>

        <p>
          각 스티커가 완성 상태에서 어느 면에 속해야 하는지 지정합니다. 현재는
          사진 대신 전개도 칸으로 기능을 시험하고 있습니다.
        </p>
      </header>

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
                allFacesComplete ? "validation-success" : "validation-progress"
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
              분류 초기화
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

          <FacePhotoUploader
            facePhotos={facePhotos}
            onSelectPhoto={handleSelectFacePhoto}
            onRemovePhoto={handleRemoveFacePhoto}
            onEditCorners={handleEditCorners}
          />

          <TargetFacePicker
            selectedFace={selectedTargetFace}
            counts={targetFaceCounts}
            onSelectFace={setSelectedTargetFace}
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

          <TargetAssemblyPreview
            cubeState={cubeState}
            selectedFace={previewTargetFace}
            onSelectFace={setPreviewTargetFace}
            onSelectSticker={(stickerId) => {
              setSelectedStickerId(stickerId);
              setNotice(null);
            }}
          />

          <TargetValidationPanel result={targetValidationResult} />

          <CubieTargetPanel result={cubieTargetResult} />

          <SolverFaceletPanel result={solverFaceletResult} />

          <CubeSolverPanel faceletResult={solverFaceletResult} />


          <CubeNet
            cubeState={cubeState}
            selectedStickerId={selectedStickerId}
            onStickerClick={handleStickerClick}
          />
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
