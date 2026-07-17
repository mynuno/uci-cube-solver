import { createInitialCubeState } from "./cube";
import type {
  CubeState,
  CubieType,
  StickerPosition,
} from "./types";

export interface CubieStickerMapping {
  stickerId: string;
  currentPosition: StickerPosition;
  targetPosition: StickerPosition;
  targetRotation: 0 | 90 | 180 | 270;
}

export interface CubieTargetAssignment {
  currentCubieId: string;
  targetCubieId: string;
  type: CubieType;
  stickerMappings: CubieStickerMapping[];
}

export interface CubieTargetResult {
  isComplete: boolean;
  assignments: CubieTargetAssignment[];
  errors: string[];
  incompleteCubieIds: string[];
  mappedCount: number;
  typeCounts: Record<CubieType, number>;
}

function createPositionKey(position: StickerPosition): string {
  return `${position.face}-${position.row}-${position.col}`;
}

function createCubiePositionSetKey(
  type: CubieType,
  positions: StickerPosition[],
): string {
  const positionKeys = positions
    .map(createPositionKey)
    .sort()
    .join("|");

  return `${type}:${positionKeys}`;
}

function createEmptyTypeCounts(): Record<CubieType, number> {
  return {
    center: 0,
    edge: 0,
    corner: 0,
  };
}

function createTargetCubieLookup(): Map<string, string> {
  const solvedState = createInitialCubeState();
  const lookup = new Map<string, string>();

  for (const cubie of Object.values(solvedState.cubies)) {
    const positions = cubie.stickerIds.map(
      (stickerId) =>
        solvedState.stickers[stickerId].currentPosition,
    );

    const key = createCubiePositionSetKey(
      cubie.type,
      positions,
    );

    lookup.set(key, cubie.id);
  }

  return lookup;
}

export function inferCubieTargets(
  cubeState: CubeState,
): CubieTargetResult {
  const targetCubieLookup = createTargetCubieLookup();

  const assignments: CubieTargetAssignment[] = [];
  const errors: string[] = [];
  const incompleteCubieIds: string[] = [];
  const typeCounts = createEmptyTypeCounts();

  const targetCubieOwners = new Map<string, string>();

  for (const cubie of Object.values(cubeState.cubies)) {
    const stickerMappings: CubieStickerMapping[] = [];
    let incomplete = false;

    for (const stickerId of cubie.stickerIds) {
      const sticker = cubeState.stickers[stickerId];

      if (
        !sticker.targetFace ||
        !sticker.targetPosition ||
        sticker.targetRotation === null
      ) {
        incomplete = true;
        break;
      }

      stickerMappings.push({
        stickerId: sticker.id,

        currentPosition: {
          ...sticker.currentPosition,
        },

        targetPosition: {
          face: sticker.targetFace,
          row: sticker.targetPosition.row,
          col: sticker.targetPosition.col,
        },

        targetRotation: sticker.targetRotation,
      });
    }

    if (incomplete) {
      incompleteCubieIds.push(cubie.id);
      continue;
    }

    const targetPositions = stickerMappings.map(
      (mapping) => mapping.targetPosition,
    );

    const positionSetKey = createCubiePositionSetKey(
      cubie.type,
      targetPositions,
    );

    const targetCubieId =
      targetCubieLookup.get(positionSetKey);

    if (!targetCubieId) {
      errors.push(
        `${cubie.id}: 지정된 목표 위치들이 하나의 유효한 ${cubie.type} 자리를 이루지 않습니다.`,
      );
      continue;
    }

    const existingOwner =
      targetCubieOwners.get(targetCubieId);

    if (existingOwner) {
      errors.push(
        `${targetCubieId} 자리에 ${existingOwner}와 ${cubie.id}가 중복 지정되었습니다.`,
      );
      continue;
    }

    targetCubieOwners.set(targetCubieId, cubie.id);

    assignments.push({
      currentCubieId: cubie.id,
      targetCubieId,
      type: cubie.type,
      stickerMappings,
    });

    typeCounts[cubie.type] += 1;
  }

  if (typeCounts.center !== 6) {
    errors.push(
      `목표가 확인된 센터 Cubie가 ${typeCounts.center}/6개입니다.`,
    );
  }

  if (typeCounts.edge !== 12) {
    errors.push(
      `목표가 확인된 엣지 Cubie가 ${typeCounts.edge}/12개입니다.`,
    );
  }

  if (typeCounts.corner !== 8) {
    errors.push(
      `목표가 확인된 코너 Cubie가 ${typeCounts.corner}/8개입니다.`,
    );
  }

  return {
    isComplete:
      assignments.length === 26 &&
      errors.length === 0 &&
      incompleteCubieIds.length === 0,

    assignments,
    errors,
    incompleteCubieIds,
    mappedCount: assignments.length,
    typeCounts,
  };
}