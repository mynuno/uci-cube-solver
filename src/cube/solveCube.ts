import Cube from "cubejs";

export interface CubeSolutionResult {
  solution: string;
  moves: string[];
  moveCount: number;
}

let solverInitialized = false;

function initializeSolver(): void {
  if (solverInitialized) {
    return;
  }

  Cube.initSolver();
  solverInitialized = true;
}

function parseMoves(solution: string): string[] {
  const trimmedSolution = solution.trim();

  if (!trimmedSolution) {
    return [];
  }

  return trimmedSolution.split(/\s+/);
}

export async function solveFaceletString(
  facelets: string,
): Promise<CubeSolutionResult> {
  if (facelets.length !== 54) {
    throw new Error(
      `솔버 입력은 54글자여야 합니다. 현재 ${facelets.length}글자입니다.`,
    );
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

  initializeSolver();

  let cube: Cube;

  try {
    cube = Cube.fromString(facelets);
  } catch (error) {
    console.error("Cube facelet parsing failed:", error);

    throw new Error(
      "현재 조각 배치는 유효한 3×3 큐브 상태로 해석되지 않습니다.",
      { cause: error },
    );
  }

  let solution: string;

  try {
    solution = cube.solve();
  } catch (error) {
    console.error("Cube solving failed:", error);

    throw new Error(
      "큐브 해답을 계산하지 못했습니다. 조각 분류와 사진 방향을 다시 확인하세요.",
      { cause: error },
    );
  }

  const moves = parseMoves(solution);

  return {
    solution,
    moves,
    moveCount: moves.length,
  };
}
