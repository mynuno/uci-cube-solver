import { describe, expect, it } from "vitest";

import { createInitialCubeState } from "./cube";
import {
  cloneCubeState,
  countProcessedFaces,
  countTargetFaces,
  createTargetPositionKey,
  createTargetPositionOwners,
  hasCompleteTargetAssignments,
} from "./projectState";
import type { CubeState, FaceName } from "./types";

function addFaceImages(state: CubeState, face: FaceName): void {
  for (const row of state.faces[face]) {
    for (const stickerId of row) {
      const sticker = state.stickers[stickerId];
      const imageId = `image-${stickerId}`;

      sticker.imageId = imageId;
      state.images[imageId] = {
        id: imageId,
        sourceType: "generated",
        url: `blob:${imageId}`,
        sourceFace: face,
        sourcePosition: {
          row: sticker.currentPosition.row,
          col: sticker.currentPosition.col,
        },
      };
    }
  }
}

describe("projectState", () => {
  it("deeply clones the mutable CubeState collections", () => {
    const state = createInitialCubeState();
    const stickerId = state.faces.F[0][0];
    const cubieId = Object.keys(state.cubies)[0];
    const imageId = "image-F-0-0";

    state.stickers[stickerId].targetFace = "F";
    state.stickers[stickerId].targetPosition = {
      row: 0,
      col: 0,
    };
    state.stickers[stickerId].targetRotation = 0;
    state.stickers[stickerId].imageId = imageId;

    state.images[imageId] = {
      id: imageId,
      sourceType: "generated",
      url: "blob:original",
      sourceFace: "F",
      sourcePosition: {
        row: 0,
        col: 0,
      },
      crop: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
    };

    const clonedState = cloneCubeState(state);

    expect(clonedState).not.toBe(state);
    expect(clonedState.stickers).not.toBe(state.stickers);
    expect(clonedState.stickers[stickerId]).not.toBe(
      state.stickers[stickerId],
    );
    expect(clonedState.stickers[stickerId].currentPosition).not.toBe(
      state.stickers[stickerId].currentPosition,
    );
    expect(clonedState.stickers[stickerId].targetPosition).not.toBe(
      state.stickers[stickerId].targetPosition,
    );
    expect(clonedState.cubies[cubieId]).not.toBe(state.cubies[cubieId]);
    expect(clonedState.cubies[cubieId].stickerIds).not.toBe(
      state.cubies[cubieId].stickerIds,
    );
    expect(clonedState.faces.F).not.toBe(state.faces.F);
    expect(clonedState.faces.F[0]).not.toBe(state.faces.F[0]);
    expect(clonedState.images[imageId]).not.toBe(state.images[imageId]);
    expect(clonedState.images[imageId].sourcePosition).not.toBe(
      state.images[imageId].sourcePosition,
    );
    expect(clonedState.images[imageId].crop).not.toBe(
      state.images[imageId].crop,
    );

    clonedState.stickers[stickerId].currentPosition.row = 1;
    clonedState.stickers[stickerId].targetPosition!.col = 1;
    clonedState.cubies[cubieId].stickerIds[0] = "changed-sticker";
    clonedState.faces.F[0][0] = "changed-face-position";
    clonedState.images[imageId].url = "blob:changed";
    clonedState.images[imageId].sourcePosition!.row = 1;
    clonedState.images[imageId].crop!.x = 0.5;

    expect(state.stickers[stickerId].currentPosition.row).toBe(0);
    expect(state.stickers[stickerId].targetPosition?.col).toBe(0);
    expect(state.cubies[cubieId].stickerIds[0]).not.toBe(
      "changed-sticker",
    );
    expect(state.faces.F[0][0]).toBe(stickerId);
    expect(state.images[imageId].url).toBe("blob:original");
    expect(state.images[imageId].sourcePosition?.row).toBe(0);
    expect(state.images[imageId].crop?.x).toBe(0);
  });

  it("counts target-face assignments", () => {
    const state = createInitialCubeState();
    const firstStickerId = state.faces.F[0][0];
    const secondStickerId = state.faces.F[0][1];
    const thirdStickerId = state.faces.U[0][0];

    state.stickers[firstStickerId].targetFace = "F";
    state.stickers[secondStickerId].targetFace = "F";
    state.stickers[thirdStickerId].targetFace = "U";

    expect(countTargetFaces(state)).toEqual({
      U: 1,
      D: 0,
      F: 2,
      B: 0,
      L: 0,
      R: 0,
    });
  });

  it("creates a stable key for a target position", () => {
    expect(
      createTargetPositionKey("R", {
        row: 2,
        col: 1,
      }),
    ).toBe("R-2-1");
  });

  it("creates target-position ownership information", () => {
    const state = createInitialCubeState();
    const firstStickerId = state.faces.F[0][0];
    const secondStickerId = state.faces.U[1][1];

    state.stickers[firstStickerId].targetFace = "B";
    state.stickers[firstStickerId].targetPosition = {
      row: 2,
      col: 1,
    };

    state.stickers[secondStickerId].targetFace = "U";
    state.stickers[secondStickerId].targetPosition = {
      row: 0,
      col: 0,
    };

    expect(createTargetPositionOwners(state)).toEqual({
      "B-2-1": firstStickerId,
      "U-0-0": secondStickerId,
    });
  });

  it("reports whether every sticker has a complete target assignment", () => {
    const state = createInitialCubeState();

    expect(hasCompleteTargetAssignments(state)).toBe(false);

    for (const sticker of Object.values(state.stickers)) {
      sticker.targetFace = sticker.currentPosition.face;
      sticker.targetPosition = {
        row: sticker.currentPosition.row,
        col: sticker.currentPosition.col,
      };
      sticker.targetRotation = 0;
    }

    expect(hasCompleteTargetAssignments(state)).toBe(true);

    state.stickers[state.faces.R[2][2]].targetRotation = null;

    expect(hasCompleteTargetAssignments(state)).toBe(false);
  });

  it("counts only faces whose nine sticker images exist", () => {
    const state = createInitialCubeState();

    addFaceImages(state, "U");
    addFaceImages(state, "F");

    expect(countProcessedFaces(state)).toBe(2);

    addFaceImages(state, "R");
    const missingImageStickerId = state.faces.R[0][0];
    const missingImageId = state.stickers[missingImageStickerId].imageId;

    if (missingImageId === null) {
      throw new Error("R면 테스트 이미지가 생성되지 않았습니다.");
    }

    delete state.images[missingImageId];

    addFaceImages(state, "D");
    state.stickers[state.faces.D[2][2]].imageId = null;

    expect(countProcessedFaces(state)).toBe(2);
  });
});
