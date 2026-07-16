import type { FaceName } from "../cube/types";

export interface FacePhoto {
  face: FaceName;
  file: File;
  fileName: string;
  previewUrl: string;
}