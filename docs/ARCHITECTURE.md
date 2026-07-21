# Architecture

## 핵심 데이터
CubeState
- stickers: 54개 스티커
- cubies: 26개 물리적 조각
- faces: 현재 위치별 스티커 ID
- images: 분할 이미지

## 주요 모듈
- src/cube/cube.ts
  초기 큐브 구조 생성

- src/cube/targetValidation.ts
  목표 면·위치·회전 검증

- src/cube/cubieTargets.ts
  물리적 큐비 목표 추론

- src/cube/solverFacelets.ts
  U R F D L B 순서의 facelet 문자열 생성

- src/cube/solveCube.ts
  브라우저용 cubejs 로딩 및 풀이 계산

- src/image/perspective.ts
  원근 보정

- src/image/splitFace.ts
  보정된 면을 9개 이미지로 분할

## cubejs 로딩
Vite의 ESM 변환 문제 때문에 cubejs를 직접 import하지 않는다.

public/vendor/cubejs/
- cube.js
- solve.js

solveCube.ts에서 script 태그로 동적 로딩한다.