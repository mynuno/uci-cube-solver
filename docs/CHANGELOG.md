## 2026-07-24

### Changed

* `App.tsx`에 있던 사진 등록, 조각 분류, 완성 검증, 풀이 안내 화면을 단계별 컴포넌트로 분리했다.
* `src/components/workflow/PhotoRegistrationStep.tsx`를 추가했다.
* `src/components/workflow/StickerClassificationStep.tsx`를 추가했다.
* `src/components/workflow/TargetValidationStep.tsx`를 추가했다.
* `src/components/workflow/SolverGuideStep.tsx`를 추가했다.
* `App.tsx`를 공통 헤더, 단계 내비게이션과 단계 컴포넌트 조합 중심으로 축소했다.
* 단계별 상태와 이벤트 핸들러는 기존과 같이 `useCubeProject.ts`에서 관리하도록 유지했다.
* 기존 문구, CSS className과 사용자 동작을 유지했다.
* `useCubeProject.ts`에 있던 순수 CubeState 계산과 복제 로직을 `src/cube/projectState.ts`로 분리했다.
* 목표 면별 배정 개수, 목표 위치 점유 정보, 전체 목표 배정 완료 여부와 사진 처리 완료 면 개수를 순수 함수로 계산하도록 변경했다.
* `cloneCubeState`가 이미지 객체의 `sourcePosition`과 `crop`을 포함한 수정 가능한 중첩 데이터까지 독립적으로 복제하도록 보강했다.
* `useCubeProject.ts`를 React 상태와 이벤트 흐름 조정 중심으로 축소했다.
* `src/cube/projectState.test.ts`를 추가해 프로젝트 상태 유틸리티의 단위 테스트를 구성했다.

### Verification

* `npm run lint` 통과
* `npm run build` 통과
* `npm run test` 통과
* cubejs 통합 테스트 2개 통과
* 브라우저에서 기존 4단계 화면과 사용자 동작을 수동 확인했다.
* projectState 단위 테스트 6개 통과
* 기존 cubejs 통합 테스트를 포함한 전체 테스트 통과

### Compatibility

* JSON `schemaVersion: 1` 호환성을 유지했다.
* `public/vendor/cubejs` 브라우저 스크립트 로딩 방식을 유지했다.


## 2026-07-23

### Changed

- `App.tsx`의 프로젝트 상태와 이벤트 핸들러를 `src/store/useCubeProject.ts`로 분리했다.
- 조각 분류 화면의 전개도와 목표 설정 영역을 세로 배치해 화면 이탈 문제를 수정했다.
- 실제 사진 조각으로 구성된 목표 면 3×3 배치 미리보기를 추가했다.
- 면별 배정 개수와 조각의 현재 위치를 확인할 수 있도록 표시를 추가했다.
- 미리보기 면 선택과 실제 조각 목표 면 변경을 분리했다.
- 저장된 조각도 다른 빈 위치, 다른 면, 다른 회전으로 다시 수정할 수 있도록 했다.
- 다른 조각이 사용 중인 위치는 계속 선택할 수 없도록 유지했다.

### Compatibility

- JSON `schemaVersion: 1` 호환성을 유지했다.
- `public/vendor/cubejs` 브라우저 스크립트 로딩 방식을 유지했다.