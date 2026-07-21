import type {
  CubeState,
  FaceName,
  GridPosition,
} from "./types";

const SOLVER_FACE_ORDER = [
  "U",
  "R",
  "F",
  "D",
  "L",
  "B",
] as const satisfies readonly FaceName[];

const GRID_VALUES = [0, 1, 2] as const;

export interface SolverFaceletResult {
  isComplete: boolean;
  facelets: string | null;
  errors: string[];
  missingStickerIds: string[];
  faceCounts: Record<FaceName, number>;
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

function getStickerIdAtPosition(
  cubeState: CubeState,
  face: FaceName,
  position: GridPosition,
): string {
  return cubeState.faces[face][position.row][position.col];
}

export function createSolverFacelets(
  cubeState: CubeState,
): SolverFaceletResult {
  const errors: string[] = [];
  const missingStickerIds: string[] = [];
  const faceCounts = createEmptyFaceCounts();
  const faceletValues: FaceName[] = [];

  for (const currentFace of SOLVER_FACE_ORDER) {
    for (const row of GRID_VALUES) {
      for (const col of GRID_VALUES) {
        const stickerId = getStickerIdAtPosition(
          cubeState,
          currentFace,
          { row, col },
        );

        const sticker = cubeState.stickers[stickerId];

        if (!sticker) {
          errors.push(
            `${currentFace}면 ${row + 1}행 ${
              col + 1
            }열의 스티커를 찾지 못했습니다.`,
          );
          continue;
        }

        if (!sticker.targetFace) {
          missingStickerIds.push(sticker.id);
          continue;
        }

        faceletValues.push(sticker.targetFace);
        faceCounts[sticker.targetFace] += 1;
      }
    }
  }

  for (const face of SOLVER_FACE_ORDER) {
    if (faceCounts[face] !== 9) {
      errors.push(
        `${face} 목표 면 조각 수가 ${faceCounts[face]}/9입니다.`,
      );
    }
  }

  const expectedCenters: Record<FaceName, FaceName> = {
    U: "U",
    R: "R",
    F: "F",
    D: "D",
    L: "L",
    B: "B",
  };

  for (const currentFace of SOLVER_FACE_ORDER) {
    const centerStickerId =
      cubeState.faces[currentFace][1][1];

    const centerSticker =
      cubeState.stickers[centerStickerId];

    if (!centerSticker?.targetFace) {
      continue;
    }

    if (
      centerSticker.targetFace !==
      expectedCenters[currentFace]
    ) {
      errors.push(
        `${currentFace}면 센터가 ${
          centerSticker.targetFace
        } 목표 면으로 지정되어 있습니다. ` +
          `기준 센터는 ${currentFace}여야 합니다.`,
      );
    }
  }

  const isComplete =
    missingStickerIds.length === 0 &&
    errors.length === 0 &&
    faceletValues.length === 54;

  return {
    isComplete,
    facelets: isComplete
      ? faceletValues.join("")
      : null,
    errors,
    missingStickerIds,
    faceCounts,
  };
}