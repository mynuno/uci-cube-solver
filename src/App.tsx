import { useMemo, useState } from "react";
import "./App.css";
import { CubeNet } from "./components/CubeNet/CubeNet";
import { ProjectControls } from "./components/ProjectControls";
import { TargetFacePicker } from "./components/TargetFacePicker";
import {
  createInitialCubeState,
  validateInitialCubeState,
} from "./cube/cube";
import { FACE_NAMES, type CubeState, type FaceName } from "./cube/types";

function cloneCubeState(state: CubeState): CubeState {
  return {
    ...state,

    stickers: Object.fromEntries(
      Object.entries(state.stickers).map(([id, sticker]) => [
        id,
        {
          ...sticker,
          currentPosition: {
            ...sticker.currentPosition,
          },
          targetPosition: sticker.targetPosition
            ? {
                ...sticker.targetPosition,
              }
            : null,
        },
      ]),
    ),

    cubies: Object.fromEntries(
      Object.entries(state.cubies).map(([id, cubie]) => [
        id,
        {
          ...cubie,
          stickerIds: [...cubie.stickerIds],
        },
      ]),
    ),

    faces: {
      U: state.faces.U.map((row) => [...row]),
      D: state.faces.D.map((row) => [...row]),
      F: state.faces.F.map((row) => [...row]),
      B: state.faces.B.map((row) => [...row]),
      L: state.faces.L.map((row) => [...row]),
      R: state.faces.R.map((row) => [...row]),
    } as CubeState["faces"],

    images: {
      ...state.images,
    },
  };
}

function createEmptyFaceCounts(): Record<FaceName, number> {
  return {
    U: 0,
    D: 0,
    F: 0,
    B: 0,
    L: 0,
    R: 0,
  };
}

function App() {
  const [cubeState, setCubeState] = useState(createInitialCubeState);

  const [selectedTargetFace, setSelectedTargetFace] =
    useState<FaceName>("F");

  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const validationErrors = validateInitialCubeState(cubeState);

  const targetFaceCounts = useMemo(() => {
    const counts = createEmptyFaceCounts();

    for (const sticker of Object.values(cubeState.stickers)) {
      if (sticker.targetFace) {
        counts[sticker.targetFace] += 1;
      }
    }

    return counts;
  }, [cubeState]);

  const assignedCount = Object.values(targetFaceCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  const allFacesComplete = FACE_NAMES.every(
    (face) => targetFaceCounts[face] === 9,
  );

  function handleStickerClick(stickerId: string) {
    setSelectedStickerId(stickerId);
    setNotice(null);

    setCubeState((previousState) => {
      const nextState = cloneCubeState(previousState);
      const sticker = nextState.stickers[stickerId];

      sticker.targetFace =
        sticker.targetFace === selectedTargetFace
          ? null
          : selectedTargetFace;

      sticker.targetPosition = null;
      sticker.targetRotation = null;

      return nextState;
    });
  }

  function handleReset() {
    setCubeState(createInitialCubeState());
    setSelectedStickerId(null);
    setSelectedTargetFace("F");
    setNotice(null);
  }

  function handleLoadCubeState(loadedState: CubeState) {
    setCubeState(loadedState);
    setSelectedStickerId(null);
    setNotice(null);
  }

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">UCI Cube Solver</p>

        <h1>큐브 조각 분류</h1>

        <p>
          각 스티커가 완성 상태에서 어느 면에 속해야 하는지 지정합니다.
          현재는 사진 대신 전개도 칸으로 기능을 시험하고 있습니다.
        </p>
      </header>

      {validationErrors.length > 0 ? (
        <section className="validation-error">
          <h2>큐브 데이터 오류</h2>

          <ul>
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <div className="status-row">
            <div
              className={
                allFacesComplete
                  ? "validation-success"
                  : "validation-progress"
              }
            >
              {allFacesComplete
                ? "조각 분류 완료: 모든 면에 9개씩 지정되었습니다."
                : `분류 진행 중: ${assignedCount}/54`}
            </div>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              분류 초기화
            </button>
          </div>

          {notice && (
            <div
              className={
                notice.type === "success"
                  ? "notice-message notice-message-success"
                  : "notice-message notice-message-error"
              }
            >
              <span>{notice.message}</span>

              <button
                type="button"
                aria-label="알림 닫기"
                onClick={() => setNotice(null)}
              >
                ×
              </button>
            </div>
          )}

          <ProjectControls
            cubeState={cubeState}
            onLoadCubeState={handleLoadCubeState}
            onLoadSuccess={(message) =>
              setNotice({
                type: "success",
                message,
              })
            }
            onLoadError={(message) =>
              setNotice({
                type: "error",
                message,
              })
            }
          />

          <TargetFacePicker
            selectedFace={selectedTargetFace}
            counts={targetFaceCounts}
            onSelectFace={setSelectedTargetFace}
          />

          <CubeNet
            cubeState={cubeState}
            selectedStickerId={selectedStickerId}
            onStickerClick={handleStickerClick}
          />
        </>
      )}
    </main>
  );
}

export default App;