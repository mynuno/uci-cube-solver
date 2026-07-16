import {
  FACE_NAMES,
  type CubeState,
  type Cubie,
  type FaceGrid,
  type FaceName,
  type GridPosition,
  type Sticker,
} from "./types";
import { GRID_INDICES } from "./constants";

function createStickerId(
  face: FaceName,
  row: GridPosition["row"],
  col: GridPosition["col"],
): string {
  return `sticker-${face}-${row}-${col}`;
}

function createFaceGrid(face: FaceName): FaceGrid {
  return GRID_INDICES.map((row) =>
    GRID_INDICES.map((col) => createStickerId(face, row, col)),
  ) as FaceGrid;
}

function createSticker(
  face: FaceName,
  row: GridPosition["row"],
  col: GridPosition["col"],
): Sticker {
  return {
    id: createStickerId(face, row, col),
    currentPosition: {
      face,
      row,
      col,
    },
    targetFace: null,
    targetPosition: null,
    targetRotation: null,
    imageId: null,
  };
}

function stickerId(
  face: FaceName,
  row: GridPosition["row"],
  col: GridPosition["col"],
): string {
  return createStickerId(face, row, col);
}

function createCubie(
  id: string,
  type: Cubie["type"],
  stickerIds: string[],
): Cubie {
  return {
    id,
    type,
    stickerIds,
  };
}

function createCenters(): Cubie[] {
  return FACE_NAMES.map((face) =>
    createCubie(`center-${face}`, "center", [stickerId(face, 1, 1)]),
  );
}

function createEdges(): Cubie[] {
  return [
    createCubie("edge-UF", "edge", [
      stickerId("U", 2, 1),
      stickerId("F", 0, 1),
    ]),
    createCubie("edge-UR", "edge", [
      stickerId("U", 1, 2),
      stickerId("R", 0, 1),
    ]),
    createCubie("edge-UB", "edge", [
      stickerId("U", 0, 1),
      stickerId("B", 0, 1),
    ]),
    createCubie("edge-UL", "edge", [
      stickerId("U", 1, 0),
      stickerId("L", 0, 1),
    ]),

    createCubie("edge-FR", "edge", [
      stickerId("F", 1, 2),
      stickerId("R", 1, 0),
    ]),
    createCubie("edge-FL", "edge", [
      stickerId("F", 1, 0),
      stickerId("L", 1, 2),
    ]),
    createCubie("edge-BR", "edge", [
      stickerId("B", 1, 0),
      stickerId("R", 1, 2),
    ]),
    createCubie("edge-BL", "edge", [
      stickerId("B", 1, 2),
      stickerId("L", 1, 0),
    ]),

    createCubie("edge-DF", "edge", [
      stickerId("D", 0, 1),
      stickerId("F", 2, 1),
    ]),
    createCubie("edge-DR", "edge", [
      stickerId("D", 1, 2),
      stickerId("R", 2, 1),
    ]),
    createCubie("edge-DB", "edge", [
      stickerId("D", 2, 1),
      stickerId("B", 2, 1),
    ]),
    createCubie("edge-DL", "edge", [
      stickerId("D", 1, 0),
      stickerId("L", 2, 1),
    ]),
  ];
}

function createCorners(): Cubie[] {
  return [
    createCubie("corner-UFR", "corner", [
      stickerId("U", 2, 2),
      stickerId("F", 0, 2),
      stickerId("R", 0, 0),
    ]),
    createCubie("corner-URB", "corner", [
      stickerId("U", 0, 2),
      stickerId("R", 0, 2),
      stickerId("B", 0, 0),
    ]),
    createCubie("corner-UBL", "corner", [
      stickerId("U", 0, 0),
      stickerId("B", 0, 2),
      stickerId("L", 0, 0),
    ]),
    createCubie("corner-ULF", "corner", [
      stickerId("U", 2, 0),
      stickerId("L", 0, 2),
      stickerId("F", 0, 0),
    ]),

    createCubie("corner-DFR", "corner", [
      stickerId("D", 0, 2),
      stickerId("F", 2, 2),
      stickerId("R", 2, 0),
    ]),
    createCubie("corner-DRB", "corner", [
      stickerId("D", 2, 2),
      stickerId("R", 2, 2),
      stickerId("B", 2, 0),
    ]),
    createCubie("corner-DBL", "corner", [
      stickerId("D", 2, 0),
      stickerId("B", 2, 2),
      stickerId("L", 2, 0),
    ]),
    createCubie("corner-DLF", "corner", [
      stickerId("D", 0, 0),
      stickerId("L", 2, 2),
      stickerId("F", 2, 0),
    ]),
  ];
}

export function createInitialCubeState(): CubeState {
  const faces = Object.fromEntries(
    FACE_NAMES.map((face) => [face, createFaceGrid(face)]),
  ) as CubeState["faces"];

  const stickers: CubeState["stickers"] = {};

  for (const face of FACE_NAMES) {
    for (const row of GRID_INDICES) {
      for (const col of GRID_INDICES) {
        const sticker = createSticker(face, row, col);
        stickers[sticker.id] = sticker;
      }
    }
  }

  const cubieList = [...createCenters(), ...createEdges(), ...createCorners()];

  const cubies = Object.fromEntries(
    cubieList.map((cubie) => [cubie.id, cubie]),
  );

  return {
    stickers,
    cubies,
    faces,
    images: {},
  };
}

export function validateInitialCubeState(state: CubeState): string[] {
  const errors: string[] = [];

  const stickerCount = Object.keys(state.stickers).length;
  const cubieList = Object.values(state.cubies);

  const centerCount = cubieList.filter(
    (cubie) => cubie.type === "center",
  ).length;

  const edgeCount = cubieList.filter(
    (cubie) => cubie.type === "edge",
  ).length;

  const cornerCount = cubieList.filter(
    (cubie) => cubie.type === "corner",
  ).length;

  if (stickerCount !== 54) {
    errors.push(`스티커 수가 54개가 아닙니다: ${stickerCount}`);
  }

  if (centerCount !== 6) {
    errors.push(`센터 조각 수가 6개가 아닙니다: ${centerCount}`);
  }

  if (edgeCount !== 12) {
    errors.push(`엣지 조각 수가 12개가 아닙니다: ${edgeCount}`);
  }

  if (cornerCount !== 8) {
    errors.push(`코너 조각 수가 8개가 아닙니다: ${cornerCount}`);
  }

  const referencedStickerIds = cubieList.flatMap(
    (cubie) => cubie.stickerIds,
  );

  const uniqueReferencedStickerIds = new Set(referencedStickerIds);

  if (referencedStickerIds.length !== 54) {
    errors.push(
      `Cubie들이 참조하는 스티커 수가 54개가 아닙니다: ${referencedStickerIds.length}`,
    );
  }

  if (uniqueReferencedStickerIds.size !== 54) {
    errors.push("둘 이상의 Cubie가 같은 스티커를 중복 참조하고 있습니다.");
  }

  for (const id of referencedStickerIds) {
    if (!state.stickers[id]) {
      errors.push(`존재하지 않는 스티커를 참조하고 있습니다: ${id}`);
    }
  }

  return errors;
}