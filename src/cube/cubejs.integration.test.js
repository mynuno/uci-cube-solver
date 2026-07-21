import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Cube = require("cubejs");

const SOLVED_FACELETS =
  "UUUUUUUUU" +
  "RRRRRRRRR" +
  "FFFFFFFFF" +
  "DDDDDDDDD" +
  "LLLLLLLLL" +
  "BBBBBBBBB";

const SCRAMBLED_FACELETS =
  "BFFBUURLB" +
  "UFDURRUBR" +
  "FFLUFLURR" +
  "FBBRDDFFD" +
  "LLULLBLDL" +
  "RRDUBDBDD";

let initialized = false;

function initializeSolver() {
  if (initialized) {
    return;
  }

  Cube.initSolver();
  initialized = true;
}

describe("cubejs solver integration", () => {
  it("recognizes an already solved cube", () => {
    initializeSolver();

    const cube = Cube.fromString(SOLVED_FACELETS);

    expect(cube.isSolved()).toBe(true);
  });

  it("solves the valid scrambled test cube", () => {
    initializeSolver();

    const cube = Cube.fromString(SCRAMBLED_FACELETS);
    const solution = cube.solve();

    expect(typeof solution).toBe("string");
    expect(solution.trim().length).toBeGreaterThan(0);

    cube.move(solution);

    expect(cube.isSolved()).toBe(true);
  });
});