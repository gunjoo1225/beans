# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** 1단계 완성 — HTML/CSS/JS 정적 사이트, localStorage 기반 동작
- **주요 기능:**
  - 상품 상세 페이지 (index.html): 이미지 갤러리, 구매 옵션, SVG 레이더 차트
  - 상품 목록 페이지 (shop.html): 3열 그리드, 로스팅 필터, 동적 렌더링
  - 관리자 페이지 (admin.html): 제품 등록/수정/삭제, 이미지 URL 및 파일 업로드
  - 디자인 시스템 (design.md): Ceremony Coffee 기반 색상·타이포·컴포넌트 스펙
- **알려진 이슈:** 파일 업로드 이미지는 base64로 localStorage 저장 (용량 한계 있음)

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

### 2026-04-23
- 프로젝트 초기 설정 (CLAUDE.md, design.md — Ceremony Coffee 레퍼런스 분석)
- 상세 페이지(index.html), 목록 페이지(shop.html), 관리자 페이지(admin.html) 제작
- localStorage 기반 제품 CRUD 및 동적 렌더링 연결, 이미지 파일 업로드 추가
