declare module "cubejs" {
  class Cube {
    static fromString(facelets: string): Cube;
    static initSolver(): void;
    static inverse(algorithm: string): string;

    solve(maxDepth?: number): string;
    move(algorithm: string): Cube;
    isSolved(): boolean;
    asString(): string;
  }

  export default Cube;
}