# Design System

## 레퍼런스
[Ceremony Coffee](https://ceremonycoffee.com/collections/single-origin)

---

## 색상 팔레트

| 역할 | 색상 | 용도 |
|------|------|------|
| Background | `#FAF8F4` | 페이지 전체 배경 (크림/베이지) |
| Surface | `#FFFFFF` | 카드, 옵션 박스 배경 |
| Text Primary | `#1A1A1A` | 제목, 주요 텍스트 |
| Text Secondary | `#6B6B6B` | 설명, 보조 텍스트 |
| Border | `#E8E4DC` | 구분선, 카드 테두리 |
| Accent | `#2C2C2C` | 버튼 배경 (다크) |
| Accent Hover | `#444444` | 버튼 호버 상태 |
| Selected | `#1A1A1A` | 선택된 옵션 |
| Error / OOS | `#C0392B` | 품절, 오류 상태 |

---

## 타이포그래피

| 요소 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| 상품명 | `'Inter', sans-serif` | 28px | 600 |
| 가격 | `'Inter', sans-serif` | 24px | 500 |
| 섹션 라벨 | `'Inter', sans-serif` | 11px | 600 (대문자) |
| 본문 | `'Inter', sans-serif` | 15px | 400 |
| 버튼 | `'Inter', sans-serif` | 14px | 500 (대문자) |

> 구글 폰트: `Inter` 사용. 시스템 폴백: `-apple-system, sans-serif`

---

## 레이아웃

### 상세 페이지 구조
```
┌─────────────────────────────────┐
│           HEADER / NAV          │
├──────────────┬──────────────────┤
│              │  상품명           │
│   이미지     │  가격             │
│   (메인)     │  플레이버 노트    │
│              │  ─────────────── │
│  ─────────── │  용량 선택        │
│  썸네일 목록 │  분쇄 선택        │
│              │  수량 선택        │
│              │  ─────────────── │
│              │  장바구니 버튼    │
│              │  바로구매 버튼    │
└──────────────┴──────────────────┘
```

- 이미지 영역: 50% / 구매 영역: 50% (데스크탑)
- 모바일: 이미지 위, 구매 옵션 아래 (세로 스택)
- 최대 너비: `1200px`, 좌우 패딩: `24px`

---

## 컴포넌트

### 옵션 선택 버튼
```
기본:    border: 1px solid #E8E4DC, background: #FFF
선택됨:  border: 1px solid #1A1A1A, background: #1A1A1A, color: #FFF
호버:    border: 1px solid #1A1A1A
```

### 장바구니 버튼
```
background: #1A1A1A
color: #FFFFFF
padding: 16px 32px
letter-spacing: 0.08em
text-transform: uppercase
border-radius: 2px (거의 사각형)
```

### 수량 선택
```
[ - ]  [ 1 ]  [ + ]
버튼: 40x40px, 테두리 있음
숫자: 가운데 정렬, 최소 너비 48px
```

---

## 간격 (Spacing)

| 토큰 | 값 | 용도 |
|------|----|------|
| xs | `8px` | 요소 내부 |
| sm | `16px` | 컴포넌트 간격 |
| md | `24px` | 섹션 내 간격 |
| lg | `40px` | 섹션 간 간격 |
| xl | `64px` | 페이지 상하 여백 |

---

## 분위기 키워드
미니멀 · 프리미엄 · 여백 · 스페셜티 커피 감성
