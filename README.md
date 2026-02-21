# Bold Fix - 옵시디언 플러그인

[English](README-en.md)

볼드(`**볼드**`)와 이탤릭(`*이탤릭*`) 뒤에 공백 없이 텍스트가 올 때 렌더링이 꼬이는 문제를 해결합니다.

## 문제

옵시디언의 CodeMirror 6 파서는 CommonMark 규격을 따릅니다. `**볼드**`나 `*이탤릭*` 뒤에 공백 없이 바로 텍스트가 오면 닫는 마커가 인식되지 않아 잘못된 렌더링이 발생합니다.

```
**볼드**다음글자  →  "볼드다음글자" 전체가 볼드로 표시됨 (잘못됨)
```

이 플러그인이 그 문제를 해결합니다.

## 적용 전/후

| 적용 전 | 적용 후 |
|--------|-------|
| ![적용 전](bold_fix_before.png) | ![적용 후](bold_fix_after.png) |

## 기능

- 라이브 프리뷰 및 읽기 모드에서 `**볼드**` 렌더링 수정
- 라이브 프리뷰 및 읽기 모드에서 `*이탤릭*` 렌더링 수정
- 커서/선택 영역이 있을 때 `**`/`*` 마커를 표시하는 옵시디언 기본 동작 유지

## 설치

### BRAT (권장)

1. [BRAT](https://github.com/TfTHacker/obsidian42-brat) 플러그인 설치
2. BRAT 설정 → "Add Beta plugin with frozen version"
3. 리포지토리 입력: `wis-graph/obsidian-bold-fix`
4. 설치 후 "Bold Fix" 활성화

### 수동 설치

```bash
# 플러그인 폴더 생성
mkdir -p /볼트경로/.obsidian/plugins/bold-fix

# 파일 다운로드
curl -L -o /볼트경로/.obsidian/plugins/bold-fix/main.js \
  https://raw.githubusercontent.com/wis-graph/obsidian-bold-fix/main/main.js

curl -L -o /볼트경로/.obsidian/plugins/bold-fix/manifest.json \
  https://raw.githubusercontent.com/wis-graph/obsidian-bold-fix/main/manifest.json
```

옵시디언 설정 → 커뮤니티 플러그인에서 "Bold Fix" 활성화.

## 개발

```bash
npm run dev    # 감시 모드
npm run build  # 프로덕션 빌드
```

## 라이선스

MIT
