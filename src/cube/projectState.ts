import {
  FACE_NAMES,
  type CubeState,
  type FaceName,
  type GridPosition,
} from "./types";

export function cloneCubeState(state: CubeState): CubeState {
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
    images: Object.fromEntries(
      Object.entries(state.images).map(([id, image]) => [
        id,
        {
          ...image,
          sourcePosition: image.sourcePosition
            ? {
                ...image.sourcePosition,
              }
            : undefined,
          crop: image.crop
            ? {
                ...image.crop,
              }
            : undefined,
        },
      ]),
    ),
  };
}

export function countTargetFaces(
  state: CubeState,
): Record<FaceName, number> {
  const counts: Record<FaceName, number> = {
    U: 0,
    D: 0,
    F: 0,
    B: 0,
    L: 0,
    R: 0,
  };

  for (const sticker of Object.values(state.stickers)) {
    if (sticker.targetFace !== null) {
      counts[sticker.targetFace] += 1;
    }
  }

  return counts;
}

export function createTargetPositionKey(
  face: FaceName,
  position: GridPosition,
): string {
  return `${face}-${position.row}-${position.col}`;
}

export function createTargetPositionOwners(
  state: CubeState,
): Record<string, string> {
  const owners: Record<string, string> = {};

  for (const sticker of Object.values(state.stickers)) {
    if (sticker.targetFace === null || sticker.targetPosition === null) {
      continue;
    }

    const key = createTargetPositionKey(
      sticker.targetFace,
      sticker.targetPosition,
    );

    owners[key] = sticker.id;
  }

  return owners;
}

export function hasCompleteTargetAssignments(state: CubeState): boolean {
  return Object.values(state.stickers).every(
    (sticker) =>
      sticker.targetFace !== null &&
      sticker.targetPosition !== null &&
      sticker.targetRotation !== null,
  );
}

export function countProcessedFaces(state: CubeState): number {
  return FACE_NAMES.filter((face) =>
    state.faces[face].every((row) =>
      row.every((stickerId) => {
        const sticker = state.stickers[stickerId];

        return (
          sticker.imageId !== null &&
          state.images[sticker.imageId] !== undefined
        );
      }),
    ),
  ).length;
}
