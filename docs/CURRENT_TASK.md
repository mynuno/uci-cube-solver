# Current Task

## 현재 작업

App.tsx의 4단계 워크플로 화면을 단계별 컴포넌트로 분리한다.

## 시작 상태

- 프로젝트 상태와 이벤트 핸들러는 `src/store/useCubeProject.ts`에서 관리
- 사진 등록, 조각 분류, 완성 검증, 풀이 안내의 4단계 워크플로 작동
- 조각 분류 화면에 실제 사진 기반 3×3 목표 면 미리보기 구현
- 미리보기 면과 실제 조각 배정 상태 분리
- 저장된 조각의 면·위치·회전 재수정 가능
- JSON schemaVersion 1 불러오기 검증 완료
- cubejs 풀이 생성과 완료 화면 검증 완료
- lint/build/test 통과

## 이번 작업 목표

- 4단계 화면을 각각 별도 컴포넌트로 이동
- App.tsx는 공통 헤더, 단계 내비게이션, 단계 컴포넌트 조합 중심으로 축소
- 기존 문구, CSS className, 사용자 동작을 유지
- 상태를 단계 컴포넌트 내부에 복제하지 않음
- `useCubeProject.ts`의 상태 전이 동작을 변경하지 않음

## 수정 예정 파일

- `src/components/workflow/PhotoRegistrationStep.tsx` 신규
- `src/components/workflow/StickerClassificationStep.tsx` 신규
- `src/components/workflow/TargetValidationStep.tsx` 신규
- `src/components/workflow/SolverGuideStep.tsx` 신규
- `src/App.tsx` 수정

## 완료 조건

- `npm run lint`
- `npm run build`
- `npm run test`
- JSON schemaVersion 1 파일 불러오기
- 4단계 이전·다음 이동 확인
- 사진 등록 및 분할 확인
- 조각 면·위치·회전 수정 확인
- 목표 면 3×3 미리보기 확인
- 완성 검증 화면에서 조각 선택 시 2단계 이동
- 풀이 생성 및 완료 화면 확인

## 주의사항

- 기능 변경과 디자인 개편을 섞지 말 것
- 기존 JSX 문구와 CSS className을 임의로 변경하지 말 것
- 단계 컴포넌트는 상태를 복제하지 말고 props로 전달받을 것
- `useCubeProject.ts`의 반환값 변경은 필요한 범위로 제한할 것
- JSON schemaVersion은 현재 1
- cubejs는 `public/vendor/cubejs` 브라우저 스크립트 로딩 방식을 유지할 것
- `npm audit fix --force`를 실행하지 말 것