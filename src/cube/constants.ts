import type { FaceName } from "./types";

export interface FaceDesign {
  label: string;
  background: "white" | "yellow" | "navy";
  foreground: "white" | "yellow" | "navy";
  contentType: "logo" | "text";
}

export const FACE_DESIGNS: Record<FaceName, FaceDesign> = {
  F: {
    label: "흰색 바탕 / 남색 로고",
    background: "white",
    foreground: "navy",
    contentType: "logo",
  },
  U: {
    label: "노란색 바탕 / 남색 로고",
    background: "yellow",
    foreground: "navy",
    contentType: "logo",
  },
  R: {
    label: "남색 바탕 / 노란색 로고",
    background: "navy",
    foreground: "yellow",
    contentType: "logo",
  },
  B: {
    label: "흰색 바탕 / 남색 글씨",
    background: "white",
    foreground: "navy",
    contentType: "text",
  },
  D: {
    label: "노란색 바탕 / 남색 글씨",
    background: "yellow",
    foreground: "navy",
    contentType: "text",
  },
  L: {
    label: "남색 바탕 / 흰색 글씨",
    background: "navy",
    foreground: "white",
    contentType: "text",
  },
};

/**
 * 2D 전개도에서 각 면을 배치할 위치.
 *
 *        U
 *   L    F    R    B
 *        D
 */
export const FACE_NET_POSITIONS: Record<
  FaceName,
  { gridRow: number; gridColumn: number }
> = {
  U: { gridRow: 0, gridColumn: 1 },
  L: { gridRow: 1, gridColumn: 0 },
  F: { gridRow: 1, gridColumn: 1 },
  R: { gridRow: 1, gridColumn: 2 },
  B: { gridRow: 1, gridColumn: 3 },
  D: { gridRow: 2, gridColumn: 1 },
};

export const GRID_INDICES = [0, 1, 2] as const;