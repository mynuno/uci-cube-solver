import { useMemo, useState } from "react";

import { inferCubieTargets } from "../cube/cubieTargets";
import { createInitialCubeState, validateInitialCubeState } from "../cube/cube";
import { createSolverFacelets } from "../cube/solverFacelets";
import { validateTargetAssignments } from "../cube/targetValidation";
import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
} from "../cube/types";
import { splitFacePhotoIntoStickerImages } from "../image/splitFace";
import type { FacePhoto, NormalizedPoint } from "../image/types";

export type WorkflowStep = 1 | 2 | 3 | 4;

export interface CubeProjectNotice {
  type: "success" | "error";
  message: string;
}

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

export function useCubeProject() {
  const [cubeState, setCubeState] = useState(createInitialCubeState);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [selectedTargetFace, setSelectedTargetFace] = useState<FaceName>("F");
  const [previewTargetFace, setPreviewTargetFace] = useState<FaceName>("F");
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<CubeProjectNotice | null>(null);
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

  function handleSelectWorkflowStep(step: WorkflowStep) {
    setCurrentStep(step);
  }

  function handleDismissNotice() {
    setNotice(null);
  }

  function handleLoadSuccess(message: string) {
    setNotice({
      type: "success",
      message,
    });
  }

  function handleLoadError(message: string) {
    setNotice({
      type: "error",
      message,
    });
  }

  function handleSelectTargetFace(face: FaceName) {
    setSelectedTargetFace(face);
  }

  function handleSelectPreviewTargetFace(face: FaceName) {
    setPreviewTargetFace(face);
  }

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

  function handleSelectStickerFromPreview(stickerId: string) {
    setSelectedStickerId(stickerId);
    setCurrentStep(2);
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

  function handleCloseCornerEditor() {
    setEditingFace(null);
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

  function moveToPreviousStep() {
    setCurrentStep(
      (previousStep) => Math.max(1, previousStep - 1) as WorkflowStep,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function moveToNextStep() {
    setCurrentStep(
      (previousStep) => Math.min(4, previousStep + 1) as WorkflowStep,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return {
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
    handleChangeStickerTargetFace,
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
  };
}
