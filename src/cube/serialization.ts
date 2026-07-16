import type { CubeState } from "./types";
import { validateInitialCubeState } from "./cube";

export interface SavedCubeProject {
  schemaVersion: 1;
  projectName: string;
  savedAt: string;
  cubeState: CubeState;
}

export function createSavedCubeProject(
  cubeState: CubeState,
  projectName = "UCI Cube Project",
): SavedCubeProject {
  return {
    schemaVersion: 1,
    projectName,
    savedAt: new Date().toISOString(),
    cubeState,
  };
}

export function serializeCubeProject(
  cubeState: CubeState,
  projectName?: string,
): string {
  const project = createSavedCubeProject(cubeState, projectName);

  return JSON.stringify(project, null, 2);
}

export function parseCubeProject(jsonText: string): SavedCubeProject {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("올바른 JSON 파일이 아닙니다.");
  }

  if (!isSavedCubeProject(parsed)) {
    throw new Error("UCI Cube Solver 프로젝트 파일 형식이 아닙니다.");
  }

  const validationErrors = validateInitialCubeState(parsed.cubeState);

  if (validationErrors.length > 0) {
    throw new Error(
      `큐브 데이터가 올바르지 않습니다: ${validationErrors.join(", ")}`,
    );
  }

  return parsed;
}

function isSavedCubeProject(value: unknown): value is SavedCubeProject {
  if (!value || typeof value !== "object") {
    return false;
  }

  const project = value as Partial<SavedCubeProject>;

  return (
    project.schemaVersion === 1 &&
    typeof project.projectName === "string" &&
    typeof project.savedAt === "string" &&
    Boolean(project.cubeState) &&
    typeof project.cubeState === "object"
  );
}