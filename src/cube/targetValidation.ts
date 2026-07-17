import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
} from "./types";

export interface TargetValidationResult {
  isComplete: boolean;
  errors: string[];
  warnings: string[];
  completedStickerCount: number;
  faceCompletedCounts: Record<FaceName, number>;
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

function createPositionKey(face: FaceName, position: GridPosition): string {
  return `${face}-${position.row}-${position.col}`;
}

export function validateTargetAssignments(
  cubeState: CubeState,
): TargetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const faceCompletedCounts = createEmptyFaceCounts();
  const positionOwners = new Map<string, string>();

  let completedStickerCount = 0;

  for (const sticker of Object.values(cubeState.stickers)) {
    const missingFields: string[] = [];

    if (!sticker.targetFace) {
      missingFields.push("목표 면");
    }

    if (!sticker.targetPosition) {
      missingFields.push("목표 위치");
    }

    if (sticker.targetRotation === null) {
      missingFields.push("목표 회전");
    }

    if (missingFields.length > 0) {
      warnings.push(`${sticker.id}: ${missingFields.join(", ")} 미지정`);
      continue;
    }

    const targetFace = sticker.targetFace;
    const targetPosition = sticker.targetPosition;

    if (!targetFace || !targetPosition) {
      continue;
    }

    completedStickerCount += 1;
    faceCompletedCounts[targetFace] += 1;

    const positionKey = createPositionKey(targetFace, targetPosition);

    const existingOwner = positionOwners.get(positionKey);

    if (existingOwner) {
      errors.push(
        `${targetFace}면 ${targetPosition.row + 1}행 ${
          targetPosition.col + 1
        }열에 ${existingOwner}와 ${sticker.id}가 중복 지정되었습니다.`,
      );
    } else {
      positionOwners.set(positionKey, sticker.id);
    }
  }

  for (const face of FACE_NAMES) {
    const completedCount = faceCompletedCounts[face];

    if (completedCount !== 9) {
      errors.push(`${face}면의 완성된 조각 수가 ${completedCount}/9입니다.`);
    }
  }

  if (completedStickerCount !== 54) {
    errors.push(
      `목표 설정이 완료된 조각이 ${completedStickerCount}/54개입니다.`,
    );
  }

  return {
    isComplete:
      errors.length === 0 &&
      warnings.length === 0 &&
      completedStickerCount === 54,
    errors,
    warnings,
    completedStickerCount,
    faceCompletedCounts,
  };
}
