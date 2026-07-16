import { useRef } from "react";
import type { CubeState } from "../cube/types";
import {
  parseCubeProject,
  serializeCubeProject,
} from "../cube/serialization";

interface ProjectControlsProps {
  cubeState: CubeState;
  onLoadCubeState: (cubeState: CubeState) => void;
  onLoadError: (message: string) => void;
  onLoadSuccess: (message: string) => void;
}

function createDownloadFileName(): string {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("-");

  return `uci-cube-${date}-${time}.json`;
}

export function ProjectControls({
  cubeState,
  onLoadCubeState,
  onLoadError,
  onLoadSuccess,
}: ProjectControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    const jsonText = serializeCubeProject(cubeState);
    const blob = new Blob([jsonText], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createDownloadFileName();
    anchor.click();

    URL.revokeObjectURL(url);

    onLoadSuccess("프로젝트 파일을 저장했습니다.");
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const jsonText = await file.text();
      const project = parseCubeProject(jsonText);

      onLoadCubeState(project.cubeState);
      onLoadSuccess(
        `${project.projectName}을 불러왔습니다. 저장 시각: ${new Date(
          project.savedAt,
        ).toLocaleString()}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "프로젝트 파일을 불러오지 못했습니다.";

      onLoadError(message);
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="project-controls">
      <div>
        <p className="eyebrow">Project data</p>
        <h2>프로젝트 저장 및 불러오기</h2>
      </div>

      <div className="project-control-buttons">
        <button
          type="button"
          className="secondary-button"
          onClick={handleSave}
        >
          JSON 저장
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => fileInputRef.current?.click()}
        >
          JSON 불러오기
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}