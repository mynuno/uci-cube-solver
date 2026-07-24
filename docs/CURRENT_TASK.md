# Current Task

## 현재 작업

`useCubeProject.ts`에 남아 있는 순수 CubeState 계산·복제 로직을 도메인 유틸리티로 분리하고 단위 테스트를 추가한다.

## 시작 상태

* 프로젝트 상태와 이벤트 핸들러는 `src/store/useCubeProject.ts`에서 관리
* 사진 등록, 조각 분류, 완성 검증, 풀이 안내 화면은 `src/components/workflow` 아래의 단계별 컴포넌트로 분리
* `App.tsx`는 공통 헤더, 단계 내비게이션, 단계 컴포넌트 조합 중심으로 축소
* 실제 사진 기반 목표 면 3×3 미리보기 구현
* 미리보기 면과 실제 조각 배정 상태 분리
* 저장된 조각의 면·위치·회전 재수정 가능
* JSON `schemaVersion: 1` 호환성 유지
* cubejs 풀이 생성과 완료 화면 정상 작동
* lint, build, test 통과

## 이번 작업 목표

* `useCubeProject.ts` 안의 React 상태와 무관한 순수 함수를 별도 모듈로 이동
* CubeState 복제, 목표 면 개수 계산, 목표 위치 점유 계산, 전체 배정 완료 여부 계산, 처리된 사진 면 개수 계산을 순수 함수로 구성
* `useCubeProject.ts`는 React 상태와 이벤트 흐름 조정에 집중하도록 축소
* 분리한 유틸리티에 단위 테스트 추가
* 기존 화면, 상태 전이, 저장 형식과 솔버 동작 유지

## 분리 대상

현재 `useCubeProject.ts`에 있는 다음 로직을 우선 검토한다.

* `cloneCubeState`
* 목표 면별 배정 개수 계산
* `createTargetPositionKey`
* 목표 위치별 점유 조각 계산
* `hasCompleteTargetAssignments`
* 사진 처리가 완료된 면 개수 계산

함수 이름과 최종 모듈 구조는 실제 호출 관계와 타입을 확인한 후 결정한다.

## 수정 예정 파일

* `src/cube/projectState.ts` 신규
* `src/cube/projectState.test.ts` 신규
* `src/store/useCubeProject.ts` 수정

필요한 경우에만 관련 타입 파일을 최소 범위로 수정한다.

## 완료 조건

* 분리된 함수가 React API에 의존하지 않음
* CubeState 복제 후 원본과 복제본이 서로 영향을 주지 않음
* 목표 면별 배정 개수가 정확하게 계산됨
* 목표 위치 점유 정보가 정확하게 계산됨
* 전체 목표 배정 완료 여부가 정확하게 계산됨
* 사진 처리가 완료된 면 개수가 정확하게 계산됨
* 기존 4단계 이전·다음 이동 정상
* JSON `schemaVersion: 1` 파일 불러오기 정상
* 조각 면·위치·회전 수정 정상
* 완성 검증과 풀이 생성 정상
* `npm run lint`
* `npm run build`
* `npm run test`

## 주의사항

* 기능 변경과 디자인 개편을 섞지 말 것
* `useCubeProject.ts`의 상태 전이 순서를 임의로 변경하지 말 것
* 유틸리티 분리를 위해 CubeState 구조를 변경하지 말 것
* 불필요하게 범용적인 추상화를 만들지 말 것
* 현재 실제로 사용되는 계산만 분리할 것
* JSON `schemaVersion`은 현재 1
* cubejs는 `public/vendor/cubejs` 브라우저 스크립트 로딩 방식을 유지할 것
* `npm audit fix --force`를 실행하지 말 것
