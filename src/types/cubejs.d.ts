interface CubeInstance {
  solve(maxDepth?: number): string;
  move(algorithm: string): CubeInstance;
  isSolved(): boolean;
  asString(): string;
}

interface CubeConstructor {
  new (): CubeInstance;
  fromString(facelets: string): CubeInstance;
  initSolver(): void;
  inverse(algorithm: string): string;
}

interface Window {
  Cube?: CubeConstructor;
}