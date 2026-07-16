import type { FaceName } from "../cube/types";

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface FacePhoto {
  face: FaceName;
  file: File;
  fileName: string;
  previewUrl: string;

  /**
   * 사진 기준 정규화 좌표.
   * x, y는 각각 0~1 범위다.
   *
   * 순서:
   * 0 = 좌측 위
   * 1 = 우측 위
   * 2 = 우측 아래
   * 3 = 좌측 아래
   */
  corners: NormalizedPoint[];
}