import { CubeNet } from "../CubeNet/CubeNet";
import { StickerTargetEditor } from "../StickerTargetEditor";
import { TargetFacePicker } from "../TargetFacePicker";
import type { useCubeProject } from "../../store/useCubeProject";

type CubeProject = ReturnType<typeof useCubeProject>;

interface StickerClassificationStepProps {
  cubeState: CubeProject["cubeState"];
  selectedTargetFace: CubeProject["selectedTargetFace"];
  selectedStickerId: CubeProject["selectedStickerId"];
  targetFaceCounts: CubeProject["targetFaceCounts"];
  targetPositionOwners: CubeProject["targetPositionOwners"];
  selectedSticker: CubeProject["selectedSticker"];
  selectedStickerImage: CubeProject["selectedStickerImage"];
  assignedCount: CubeProject["assignedCount"];
  onSelectTargetFace: CubeProject["handleSelectTargetFace"];
  onStickerClick: CubeProject["handleStickerClick"];
  onChangeStickerTargetPosition: CubeProject["handleChangeStickerTargetPosition"];
  onChangeStickerRotation: CubeProject["handleChangeStickerRotation"];
  onClearStickerTarget: CubeProject["handleClearStickerTarget"];
}

export function StickerClassificationStep({
  cubeState,
  selectedTargetFace,
  selectedStickerId,
  targetFaceCounts,
  targetPositionOwners,
  selectedSticker,
  selectedStickerImage,
  assignedCount,
  onSelectTargetFace,
  onStickerClick,
  onChangeStickerTargetPosition,
  onChangeStickerRotation,
  onClearStickerTarget,
}: StickerClassificationStepProps) {
  return (
    <section className="workflow-content">
      <div className="workflow-section-heading">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>54개 조각 목표 지정</h2>
          <p>
            현재 큐브의 조각을 선택하고, 완성 상태에서 들어갈 면·위치·회전
            방향을 지정하세요.
          </p>
        </div>
        <div className="workflow-progress-badge">
          {assignedCount}/54개 분류
        </div>
      </div>
      <TargetFacePicker
        selectedFace={selectedTargetFace}
        counts={targetFaceCounts}
        onSelectFace={onSelectTargetFace}
      />
      <div className="classification-layout">
        <CubeNet
          cubeState={cubeState}
          selectedStickerId={selectedStickerId}
          onStickerClick={onStickerClick}
        />
        <StickerTargetEditor
          cubeState={cubeState}
          sticker={selectedSticker}
          image={selectedStickerImage}
          previewFace={selectedTargetFace}
          positionOwners={targetPositionOwners}
          onSelectTargetFace={onSelectTargetFace}
          onChangeTargetPosition={onChangeStickerTargetPosition}
          onChangeRotation={onChangeStickerRotation}
          onClear={onClearStickerTarget}
        />
      </div>
    </section>
  );
}
