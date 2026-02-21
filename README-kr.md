# Bold Fix - 옵시디언 플러그인

볼드(`**볼드**`)와 이탤릭(`*이탤릭*`) 뒤에 공백 없이 텍스트가 올 때 렌더링이 꼬이는 문제를 해결합니다.

## 문제

옵시디언의 CodeMirror 6 파서는 CommonMark 규격을 따릅니다. `**볼드**`나 `*이탤릭*` 뒤에 공백 없이 바로 텍스트가 오면 닫는 마커가 인식되지 않아 잘못된 렌더링이 발생합니다.

```
**볼드**다음글자  →  "볼드다음글자" 전체가 볼드로 표시됨 (잘못됨)
```

이 플러그인이 그 문제를 해결합니다.

## 기능

- 라이브 프리뷰 및 읽기 모드에서 `**볼드**` 렌더링 수정
- 라이브 프리뷰 및 읽기 모드에서 `*이탤릭*` 렌더링 수정
- 커서/선택 영역이 있을 때 `**`/`*` 마커를 표시하는 옵시디언 기본 동작 유지

## 설치

### 수동 설치

1. [Releases](https://github.com/wis-graph/obsidian-bold-fix/releases)에서 `main.js`와 `manifest.json` 다운로드
2. 볼트의 `.obsidian/plugins/` 폴더에 `bold-fix` 폴더 생성
3. 다운로드한 파일들을 폴더에 복사
4. 옵시디언 설정 → 커뮤니티 플러그인에서 "Bold Fix" 활성화

### 소스에서 빌드

```bash
git clone https://github.com/wis-graph/obsidian-bold-fix.git
cd obsidian-bold-fix
npm install
npm run build
```

`main.js`와 `manifest.json`을 볼트의 `.obsidian/plugins/bold-fix/`에 복사하세요.

## 개발

```bash
npm run dev    # 감시 모드
npm run build  # 프로덕션 빌드
```

## 라이선스

MIT
