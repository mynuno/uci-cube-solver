import { GRID_INDICES } from "../cube/constants";
import type {
  FaceName,
  GridPosition,
  ImageAsset,
} from "../cube/types";
import { createPerspectiveCorrectedCanvas } from "./perspective";
import type { FacePhoto } from "./types";

export interface GeneratedStickerImage {
  image: ImageAsset;
  position: GridPosition;
}

const CORRECTED_FACE_SIZE = 600;
const TILE_SIZE = CORRECTED_FACE_SIZE / 3;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("원본 사진을 불러오지 못했습니다."));

    image.src = url;
  });
}

function createStickerImageId(
  face: FaceName,
  row: GridPosition["row"],
  col: GridPosition["col"],
): string {
  return `image-${face}-${row}-${col}`;
}

export async function splitFacePhotoIntoStickerImages(
  photo: FacePhoto,
): Promise<GeneratedStickerImage[]> {
  if (photo.corners.length !== 4) {
    throw new Error("먼저 꼭짓점 네 개를 지정해야 합니다.");
  }

  const sourceImage = await loadImage(photo.previewUrl);

  const correctedCanvas = createPerspectiveCorrectedCanvas(
    sourceImage,
    photo.corners,
    CORRECTED_FACE_SIZE,
  );

  const results: GeneratedStickerImage[] = [];

  for (const row of GRID_INDICES) {
    for (const col of GRID_INDICES) {
      const tileCanvas = document.createElement("canvas");

      tileCanvas.width = TILE_SIZE;
      tileCanvas.height = TILE_SIZE;

      const context = tileCanvas.getContext("2d");

      if (!context) {
        throw new Error("조각 이미지 Canvas를 만들지 못했습니다.");
      }

      context.drawImage(
        correctedCanvas,
        col * TILE_SIZE,
        row * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        0,
        0,
        TILE_SIZE,
        TILE_SIZE,
      );

      const imageId = createStickerImageId(photo.face, row, col);

      results.push({
        position: {
          row,
          col,
        },
        image: {
          id: imageId,
          sourceType: "generated",
          url: tileCanvas.toDataURL("image/png"),
          originalFileName: photo.fileName,
          sourceFace: photo.face,
          sourcePosition: {
            row,
            col,
          },
        },
      });
    }
  }

  return results;
}