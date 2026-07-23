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

## 조각 분류의 미리보기 면과 실제 목표 배정은 분리한다

조각 분류 화면에서 사용자가 둘러보는 면과 선택된 조각의 실제 `targetFace`는 별개의 상태로 관리한다.

- 면 미리보기 전환만으로 조각의 저장된 배정은 변경하지 않는다.
- 빈 위치를 선택할 때 실제 목표 면과 위치를 함께 변경한다.
- 다른 조각이 점유한 위치만 선택을 차단한다.
- 저장된 조각도 위치와 회전을 다시 수정할 수 있다.
- 면 또는 위치를 이동할 때 기존 회전값은 유지한다.