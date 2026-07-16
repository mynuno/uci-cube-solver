import { useRef, useState } from "react";
import { FACE_DESIGNS } from "../../cube/constants";
import { FACE_NAMES, type FaceName } from "../../cube/types";
import type { FacePhoto } from "../../image/types";

interface FacePhotoUploaderProps {
  facePhotos: Partial<Record<FaceName, FacePhoto>>;
  onSelectPhoto: (face: FaceName, file: File) => void;
  onRemovePhoto: (face: FaceName) => void;
  onEditCorners: (face: FaceName) => void;
}

const CAPTURE_GUIDES: Record<FaceName, string> = {
  F: "U와 맞닿는 변이 사진 위쪽",
  R: "U와 맞닿는 변이 사진 위쪽",
  B: "U와 맞닿는 변이 사진 위쪽",
  L: "U와 맞닿는 변이 사진 위쪽",
  U: "F와 맞닿는 변이 사진 아래쪽",
  D: "F와 맞닿는 변이 사진 위쪽",
};

interface FacePhotoCardProps {
  face: FaceName;
  photo?: FacePhoto;
  onSelectPhoto: (face: FaceName, file: File) => void;
  onRemovePhoto: (face: FaceName) => void;
  onEditCorners: (face: FaceName) => void;
}

function FacePhotoCard({
  face,
  photo,
  onSelectPhoto,
  onRemovePhoto,
  onEditCorners,
}: FacePhotoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const design = FACE_DESIGNS[face];
  const cornersComplete = photo?.corners.length === 4;
  const isLandscape = imageAspectRatio === null || imageAspectRatio >= 1;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    setImageAspectRatio(null);
    onSelectPhoto(face, file);
    event.target.value = "";
  }

  return (
    <article className="face-photo-card">
      <header className="face-photo-card-header">
        <div>
          <strong>{face}</strong>
          <span>{design.label}</span>
        </div>

        <small>
          {!photo
            ? "사진 필요"
            : cornersComplete
              ? "꼭짓점 완료"
              : "꼭짓점 필요"}
        </small>
      </header>

      <button
        type="button"
        className="face-photo-preview"
        onClick={() =>
          photo ? onEditCorners(face) : inputRef.current?.click()
        }
      >
        {photo ? (
          <div
            className={`face-photo-image-stage ${
              isLandscape ? "is-landscape" : "is-portrait"
            }`}
            style={{
              aspectRatio:
                imageAspectRatio && Number.isFinite(imageAspectRatio)
                  ? String(imageAspectRatio)
                  : undefined,
            }}
          >
            <img
              src={photo.previewUrl}
              alt={`${face}면 미리보기`}
              onLoad={(event) => {
                const image = event.currentTarget;

                if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                  setImageAspectRatio(
                    image.naturalWidth / image.naturalHeight,
                  );
                }
              }}
            />

            {photo.corners.map((point, index) => (
              <span
                key={index}
                className="face-photo-corner-marker"
                style={{
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                }}
              >
                {index + 1}
              </span>
            ))}
          </div>
        ) : (
          <span className="face-photo-placeholder">
            <span>사진 선택</span>
            <small>{CAPTURE_GUIDES[face]}</small>
          </span>
        )}
      </button>

      {photo && (
        <div className="face-photo-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onEditCorners(face)}
          >
            꼭짓점 지정
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => inputRef.current?.click()}
          >
            교체
          </button>

          <button
            type="button"
            className="danger-text-button"
            onClick={() => onRemovePhoto(face)}
          >
            삭제
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </article>
  );
}

export function FacePhotoUploader({
  facePhotos,
  onSelectPhoto,
  onRemovePhoto,
  onEditCorners,
}: FacePhotoUploaderProps) {
  const uploadedCount = FACE_NAMES.filter(
    (face) => facePhotos[face],
  ).length;

  const completedCornerCount = FACE_NAMES.filter(
    (face) => facePhotos[face]?.corners.length === 4,
  ).length;

  return (
    <section className="photo-uploader">
      <div className="photo-uploader-heading">
        <div>
          <p className="eyebrow">Face photos</p>
          <h2>현재 큐브의 6면 사진</h2>
        </div>

        <div className="photo-progress-group">
          <div
            className={
              uploadedCount === 6
                ? "photo-upload-count photo-upload-count-complete"
                : "photo-upload-count"
            }
          >
            사진 {uploadedCount}/6
          </div>

          <div
            className={
              completedCornerCount === 6
                ? "photo-upload-count photo-upload-count-complete"
                : "photo-upload-count"
            }
          >
            꼭짓점 {completedCornerCount}/6
          </div>
        </div>
      </div>

      <p className="photo-uploader-description">
        그림이 똑바로 보이도록 임의로 돌리지 말고, 각 면이 서로
        맞닿는 방향을 기준으로 촬영한 사진을 넣어야 합니다.
      </p>

      <div className="face-photo-grid">
        {FACE_NAMES.map((face) => (
          <FacePhotoCard
            key={face}
            face={face}
            photo={facePhotos[face]}
            onSelectPhoto={onSelectPhoto}
            onRemovePhoto={onRemovePhoto}
            onEditCorners={onEditCorners}
          />
        ))}
      </div>
    </section>
  );
}