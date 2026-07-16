import { useRef } from "react";
import { FACE_DESIGNS } from "../../cube/constants";
import { FACE_NAMES, type FaceName } from "../../cube/types";
import type { FacePhoto } from "../../image/types";

interface FacePhotoUploaderProps {
  facePhotos: Partial<Record<FaceName, FacePhoto>>;
  onSelectPhoto: (face: FaceName, file: File) => void;
  onRemovePhoto: (face: FaceName) => void;
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
}

function FacePhotoCard({
  face,
  photo,
  onSelectPhoto,
  onRemovePhoto,
}: FacePhotoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const design = FACE_DESIGNS[face];

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

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

        <small>{photo ? "사진 등록됨" : "사진 필요"}</small>
      </header>

      <button
        type="button"
        className="face-photo-preview"
        onClick={() => inputRef.current?.click()}
      >
        {photo ? (
          <img
            src={photo.previewUrl}
            alt={`${face}면 미리보기`}
          />
        ) : (
          <span>
            사진 선택
            <small>{CAPTURE_GUIDES[face]}</small>
          </span>
        )}
      </button>

      {photo && (
        <div className="face-photo-actions">
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
}: FacePhotoUploaderProps) {
  const uploadedCount = FACE_NAMES.filter(
    (face) => facePhotos[face],
  ).length;

  return (
    <section className="photo-uploader">
      <div className="photo-uploader-heading">
        <div>
          <p className="eyebrow">Face photos</p>
          <h2>현재 큐브의 6면 사진</h2>
        </div>

        <div
          className={
            uploadedCount === 6
              ? "photo-upload-count photo-upload-count-complete"
              : "photo-upload-count"
          }
        >
          {uploadedCount}/6
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
          />
        ))}
      </div>
    </section>
  );
}