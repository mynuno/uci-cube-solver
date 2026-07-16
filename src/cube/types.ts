export const FACE_NAMES = ["U", "D", "F", "B", "L", "R"] as const;

export type FaceName = (typeof FACE_NAMES)[number];

export type CubieType = "center" | "edge" | "corner";

export type ImageSourceType =
  | "local-file"
  | "google-drive"
  | "camera"
  | "generated";

export interface GridPosition {
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
}

export interface StickerPosition extends GridPosition {
  face: FaceName;
}

export interface ImageAsset {
  id: string;
  sourceType: ImageSourceType;

  /**
   * 로컬 object URL, Drive 다운로드 URL 또는 앱 내부 경로.
   * 장기 저장 시에는 URL 대신 별도 파일 저장 전략이 필요하다.
   */
  url: string;

  originalFileName?: string;
  sourceFace?: FaceName;
  sourcePosition?: GridPosition;

  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Sticker {
  id: string;

  /**
   * 현재 큐브에서 이 스티커가 보이는 위치.
   */
  currentPosition: StickerPosition;

  /**
   * 사용자가 판별한, 이 조각이 최종적으로 속해야 하는 면.
   */
  targetFace: FaceName | null;

  /**
   * 최종 그림 안에서의 정확한 위치.
   * 초기에는 알 수 없으므로 null이다.
   */
  targetPosition: GridPosition | null;

  /**
   * 목표 상태에서 필요한 회전.
   * 사람이 직접 입력하지 않고 추론 단계에서 결정한다.
   */
  targetRotation: 0 | 90 | 180 | 270 | null;

  imageId: string | null;
}

export interface Cubie {
  id: string;
  type: CubieType;

  /**
   * 한 Cubie에 속한 Sticker들의 ID.
   * center는 1개, edge는 2개, corner는 3개다.
   */
  stickerIds: string[];
}

export type FaceGrid = [
  [string, string, string],
  [string, string, string],
  [string, string, string],
];

export interface CubeState {
  stickers: Record<string, Sticker>;
  cubies: Record<string, Cubie>;

  /**
   * 각 면 3×3 칸에 현재 존재하는 Sticker ID.
   */
  faces: Record<FaceName, FaceGrid>;

  images: Record<string, ImageAsset>;
}