export interface CubeSolutionResult {
  solution: string;
  moves: string[];
  moveCount: number;
}

interface CubeInstance {
  solve(maxDepth?: number): string;
}

interface CubeConstructor {
  fromString(facelets: string): CubeInstance;
  initSolver(): void;
}

let solverInitialized = false;
let cubeConstructor: CubeConstructor | null = null;

async function loadCubeConstructor(): Promise<CubeConstructor> {
  if (cubeConstructor) {
    return cubeConstructor;
  }

  const cubeModule = await import("cubejs");

  const importedCube =
    "default" in cubeModule ? cubeModule.default : cubeModule;

  cubeConstructor = importedCube as unknown as CubeConstructor;

  return cubeConstructor;
}

async function initializeSolver(): Promise<CubeConstructor> {
  const Cube = await loadCubeConstructor();

  if (!solverInitialized) {
    Cube.initSolver();
    solverInitialized = true;
  }

  return Cube;
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

  const Cube = await initializeSolver();

  let cube: CubeInstance;

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