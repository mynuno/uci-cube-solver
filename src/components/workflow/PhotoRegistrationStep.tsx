import { FacePhotoUploader } from "../image/FacePhotoUploader";
import type { useCubeProject } from "../../store/useCubeProject";

type CubeProject = ReturnType<typeof useCubeProject>;

interface PhotoRegistrationStepProps {
  facePhotos: CubeProject["facePhotos"];
  processedFaceCount: CubeProject["processedFaceCount"];
  onSelectFacePhoto: CubeProject["handleSelectFacePhoto"];
  onRemoveFacePhoto: CubeProject["handleRemoveFacePhoto"];
  onEditCorners: CubeProject["handleEditCorners"];
}

export function PhotoRegistrationStep({
  facePhotos,
  processedFaceCount,
  onSelectFacePhoto,
  onRemoveFacePhoto,
  onEditCorners,
}: PhotoRegistrationStepProps) {
  return (
    <section className="workflow-content">
      <div className="workflow-section-heading">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2>6면 사진 등록 및 보정</h2>
          <p>
            각 면의 사진을 등록한 뒤 네 모서리를 지정하면 9개 스티커
            이미지로 자동 분할됩니다.
          </p>
        </div>
        <div className="workflow-progress-badge">
          {processedFaceCount}/6면 처리
        </div>
      </div>
      <FacePhotoUploader
        facePhotos={facePhotos}
        onSelectPhoto={onSelectFacePhoto}
        onRemovePhoto={onRemoveFacePhoto}
        onEditCorners={onEditCorners}
      />
      <div className="workflow-tip">
        JSON 테스트 파일을 불러온 경우 사진 등록 없이 바로 다음 단계로
        이동해도 됩니다.
      </div>
    </section>
  );
}
