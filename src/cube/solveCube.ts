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

let scriptsLoaded = false;
let loadingPromise: Promise<CubeConstructor> | null = null;
let solverInitialized = false;

function loadScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${source}"]`,
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => {
          reject(new Error(`${source} 스크립트를 불러오지 못했습니다.`));
        },
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = source;
    script.async = false;

    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );

    script.addEventListener(
      "error",
      () => {
        reject(new Error(`${source} 스크립트를 불러오지 못했습니다.`));
      },
      { once: true },
    );

    document.head.appendChild(script);
  });
}

async function loadCubeConstructor(): Promise<CubeConstructor> {
  if (scriptsLoaded && window.Cube) {
    return window.Cube;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    await loadScript("/vendor/cubejs/cube.js");
    await loadScript("/vendor/cubejs/solve.js");

    if (!window.Cube) {
      throw new Error(
        "Cube 솔버 라이브러리가 전역 객체에 등록되지 않았습니다.",
      );
    }

    scriptsLoaded = true;

    return window.Cube;
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
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

  let Cube: CubeConstructor;

  try {
    Cube = await initializeSolver();
  } catch (error) {
    console.error("Cube solver loading failed:", error);

    throw new Error(
      "큐브 솔버 라이브러리를 불러오지 못했습니다.",
      { cause: error },
    );
  }

  let cube: CubeInstance;

  try {
    cube = Cube.fromString(facelets);
  } catch (error) {
    console.error("Cube facelet parsing failed:", error);

    throw new Error(
      "현재 조각 배치를 유효한 3×3 큐브 상태로 해석하지 못했습니다.",
      { cause: error },
    );
  }

  let solution: string;

  try {
    solution = cube.solve();
  } catch (error) {
    console.error("Cube solving failed:", error);

    throw new Error(
      "큐브 해답을 계산하지 못했습니다. 조각 분류를 다시 확인하세요.",
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