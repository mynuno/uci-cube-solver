import type { NormalizedPoint } from "./types";

interface PixelPoint {
  x: number;
  y: number;
}

const OUTPUT_SIZE = 450;
const MAX_SOURCE_DIMENSION = 1600;

function solveLinearSystem(matrix: number[][], values: number[]): number[] {
  const size = values.length;
  const augmented = matrix.map((row, index) => [...row, values[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column;

    for (let row = column + 1; row < size; row += 1) {
      if (
        Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])
      ) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][column]) < 1e-10) {
      throw new Error("선택한 꼭짓점으로 원근 변환을 계산할 수 없습니다.");
    }

    [augmented[column], augmented[pivotRow]] = [
      augmented[pivotRow],
      augmented[column],
    ];

    const pivot = augmented[column][column];

    for (let index = column; index <= size; index += 1) {
      augmented[column][index] /= pivot;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) {
        continue;
      }

      const factor = augmented[row][column];

      for (let index = column; index <= size; index += 1) {
        augmented[row][index] -= factor * augmented[column][index];
      }
    }
  }

  return augmented.map((row) => row[size]);
}

/**
 * 정사각형 출력 좌표를 원본 사진 좌표로 변환하는 homography를 계산한다.
 */
function calculateDestinationToSourceHomography(
  sourcePoints: PixelPoint[],
  outputSize: number,
): number[] {
  const destinationPoints: PixelPoint[] = [
    { x: 0, y: 0 },
    { x: outputSize - 1, y: 0 },
    { x: outputSize - 1, y: outputSize - 1 },
    { x: 0, y: outputSize - 1 },
  ];

  const matrix: number[][] = [];
  const values: number[] = [];

  for (let index = 0; index < 4; index += 1) {
    const destination = destinationPoints[index];
    const source = sourcePoints[index];

    const { x, y } = destination;
    const { x: sourceX, y: sourceY } = source;

    matrix.push([x, y, 1, 0, 0, 0, -sourceX * x, -sourceX * y]);
    values.push(sourceX);

    matrix.push([0, 0, 0, x, y, 1, -sourceY * x, -sourceY * y]);
    values.push(sourceY);
  }

  return solveLinearSystem(matrix, values);
}

function mapPoint(x: number, y: number, homography: number[]): PixelPoint {
  const [h11, h12, h13, h21, h22, h23, h31, h32] = homography;

  const denominator = h31 * x + h32 * y + 1;

  return {
    x: (h11 * x + h12 * y + h13) / denominator,
    y: (h21 * x + h22 * y + h23) / denominator,
  };
}

function sampleBilinear(
  source: ImageData,
  x: number,
  y: number,
): [number, number, number, number] {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return [0, 0, 0, 0];
  }

  const safeX = Math.max(0, Math.min(source.width - 1, x));
  const safeY = Math.max(0, Math.min(source.height - 1, y));

  const x0 = Math.floor(safeX);
  const y0 = Math.floor(safeY);
  const x1 = Math.min(x0 + 1, source.width - 1);
  const y1 = Math.min(y0 + 1, source.height - 1);

  const weightX = safeX - x0;
  const weightY = safeY - y0;

  function pixelAt(
    pixelX: number,
    pixelY: number,
  ): [number, number, number, number] {
    const offset = (pixelY * source.width + pixelX) * 4;

    return [
      source.data[offset],
      source.data[offset + 1],
      source.data[offset + 2],
      source.data[offset + 3],
    ];
  }

  const topLeft = pixelAt(x0, y0);
  const topRight = pixelAt(x1, y0);
  const bottomLeft = pixelAt(x0, y1);
  const bottomRight = pixelAt(x1, y1);

  return topLeft.map((_, channel) => {
    const top =
      topLeft[channel] * (1 - weightX) +
      topRight[channel] * weightX;

    const bottom =
      bottomLeft[channel] * (1 - weightX) +
      bottomRight[channel] * weightX;

    return Math.round(
      top * (1 - weightY) + bottom * weightY,
    );
  }) as [number, number, number, number];
}

export function createPerspectiveCorrectedCanvas(
  image: HTMLImageElement,
  corners: NormalizedPoint[],
  outputSize = OUTPUT_SIZE,
): HTMLCanvasElement {
  if (corners.length !== 4) {
    throw new Error("원근 보정에는 꼭짓점 네 개가 필요합니다.");
  }

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  if (naturalWidth <= 0 || naturalHeight <= 0) {
    throw new Error("사진의 크기 정보를 읽지 못했습니다.");
  }

  /**
   * 고해상도 휴대폰 사진을 원본 크기 그대로 ImageData로 만들면
   * 브라우저 메모리가 급격히 증가할 수 있으므로 미리 축소한다.
   */
  const sourceScale = Math.min(
    1,
    MAX_SOURCE_DIMENSION / Math.max(naturalWidth, naturalHeight),
  );

  const sourceWidth = Math.max(1, Math.round(naturalWidth * sourceScale));

  const sourceHeight = Math.max(1, Math.round(naturalHeight * sourceScale));

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;

  const sourceContext = sourceCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!sourceContext) {
    throw new Error("원본 이미지 Canvas를 생성하지 못했습니다.");
  }

  sourceContext.imageSmoothingEnabled = true;
  sourceContext.imageSmoothingQuality = "high";

  sourceContext.drawImage(
    image,
    0,
    0,
    naturalWidth,
    naturalHeight,
    0,
    0,
    sourceWidth,
    sourceHeight,
  );

  const sourceImageData = sourceContext.getImageData(
    0,
    0,
    sourceWidth,
    sourceHeight,
  );

  const sourcePoints = corners.map((point) => ({
    x: point.x * (sourceWidth - 1),
    y: point.y * (sourceHeight - 1),
  }));

  const homography = calculateDestinationToSourceHomography(
    sourcePoints,
    outputSize,
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;

  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("보정 결과 Canvas를 생성하지 못했습니다.");
  }

  const outputImageData = outputContext.createImageData(outputSize, outputSize);

  for (let y = 0; y < outputSize; y += 1) {
    for (let x = 0; x < outputSize; x += 1) {
      const sourcePoint = mapPoint(x, y, homography);

      const pixel = sampleBilinear(
        sourceImageData,
        sourcePoint.x,
        sourcePoint.y,
      );

      const outputOffset = (y * outputSize + x) * 4;

      outputImageData.data[outputOffset] = pixel[0];
      outputImageData.data[outputOffset + 1] = pixel[1];
      outputImageData.data[outputOffset + 2] = pixel[2];
      outputImageData.data[outputOffset + 3] = pixel[3];
    }
  }

  outputContext.putImageData(outputImageData, 0, 0);

  return outputCanvas;
}
