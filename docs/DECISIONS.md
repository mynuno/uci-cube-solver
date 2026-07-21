# Technical Decisions

## cubejs는 public/vendor에서 로드
Vite 동적 import에서 CommonJS 호환 오류가 발생했기 때문.
solveCube.ts의 script 로더 방식을 유지한다.

## 표준 facelet 순서
U R F D L B, 각 면 row-major.

## UI는 4단계 워크플로
1. 사진 등록
2. 조각 분류
3. 완성 검증
4. 풀이 안내

## JSON 저장 형식
schemaVersion: 1
최상위 키:
- projectName
- savedAt
- cubeState