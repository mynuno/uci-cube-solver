# **대화 시작**

UCI Cube Solver 완성형 개발을 이어갈 거야.

저장소:
https://github.com/mynuno/uci-cube-solver

작업을 시작하기 전에 저장소의 최신 코드를 기준으로 다음 문서를 먼저 읽고 현재 상태를 요약해줘.

- docs/PROJECT_CONTEXT.md
- docs/ARCHITECTURE.md
- docs/ROADMAP.md
- docs/CURRENT_TASK.md
- docs/DECISIONS.md
- docs/CHANGELOG.md

그리고 아래 명령 결과도 확인 기준으로 사용할 거야.

- git status
- git log --oneline -5
- tree .\src /F

이번 대화에서는 docs/CURRENT_TASK.md에 적힌 작업만 진행한다.

필수 원칙:
1. 실제 저장소 코드가 가장 높은 우선순위의 진실이다.
2. 기존 사용자 동작과 UI를 임의로 바꾸지 않는다.
3. JSON schemaVersion 1 호환성을 유지한다.
4. cubejs는 public/vendor/cubejs의 브라우저 스크립트를 solveCube.ts에서 로드하는 현재 방식을 유지한다.
5. 기능 리팩터링과 디자인 개편을 같은 커밋에 섞지 않는다.
6. npm audit fix --force를 실행하지 않는다.
7. 수정 코드는 현재 파일 구조와 타입을 확인한 후 제시한다.
8. 부분 수정이 복잡하면 해당 파일의 전체 교체 코드를 제공한다.
9. 작업 완료 전 반드시 다음을 확인한다.
   - npm run lint
   - npm run build
   - npm run test
10. 작업 종료 시 다음을 정리한다.
   - 변경 파일
   - 구현 내용
   - 테스트 결과
   - 알려진 문제
   - 권장 커밋 메시지
   - 다음 작업용 docs/CURRENT_TASK.md 전체 내용
   - docs/DECISIONS.md 또는 docs/CHANGELOG.md에 추가할 내용

# **대화 종료**
이번 작업을 마무리하면서 다음 내용을 만들어줘.

1. 변경된 파일 목록
2. 구현한 내용
3. 테스트 결과
4. 알려진 문제
5. Git 커밋 메시지
6. 다음 대화용 CURRENT_TASK.md 전체 내용
7. DECISIONS.md에 추가할 내용

# **새 대화에는**
# 첨부
git status
git log --oneline -5
