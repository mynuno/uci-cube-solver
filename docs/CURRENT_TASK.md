# Current Task

## 현재 작업
App.tsx의 상태와 이벤트 핸들러를 store/useCubeProject.ts로 분리한다.

## 시작 상태
- 4단계 워크플로 작동
- JSON 테스트 파일로 솔버 실행 성공
- 완료 축하 화면 작동
- lint/build/test 통과
- 최신 커밋은 GitHub에 push 완료

## 이번 작업 목표
- UI 동작 변화 없음
- CubeState 관련 상태와 핸들러를 custom hook으로 이동
- App.tsx는 화면 조합 중심으로 축소
- 기존 테스트 모두 통과

## 수정 예정 파일
- src/store/useCubeProject.ts 신규
- src/App.tsx 수정

## 완료 조건
- npm run lint
- npm run build
- npm run test
- JSON 테스트 파일 불러오기
- 4단계 이동
- 풀이 생성 확인

## 주의사항
- cubejs 로딩 방식을 정적 import로 되돌리지 말 것
- JSON schemaVersion은 현재 1
- 기존 저장 파일 호환성을 깨지 말 것