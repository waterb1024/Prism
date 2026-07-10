# Prism

매주 Product Hunt 상위 서비스를 스펙트럼처럼 분해해 보여주는 리서치 대시보드. Next.js + Turso(libSQL) + Render.

원격 에이전트가 매주 자동으로 리포트를 생성해 이 앱의 인그레스 API 로 밀어넣고, 사용자는 대시보드/상세 페이지에서 시각화된 인사이트를 읽는다.

## 로컬 개발

1. `.env` 작성

   ```bash
   TURSO_URL=libsql://...
   TURSO_TOKEN=...
   INGEST_API_KEY=원격-에이전트-공유-비밀
   PH_TOKEN=          # (선택) Product Hunt 공식 API 토큰. 있으면 서비스 아이콘 리졸빙 정확도 상승
   ```

2. 의존성 설치 + DB 마이그레이션

   ```bash
   npm install
   npm run db:migrate
   ```

3. 개발 서버

   ```bash
   npm run dev
   ```

   브라우저에서 `http://localhost:8080` 접속. 로그인 없이 바로 열린다.

## Render 배포

`render.yaml` 을 포함한 Render **Blueprint** 프로젝트.

1. GitHub push
2. Render 대시보드에서 **New → Blueprint** → 이 레포 연결
3. sync: false 로 표시된 환경 변수 입력:
   - `TURSO_URL`
   - `TURSO_TOKEN`
   - `INGEST_API_KEY`
   - `PH_TOKEN` (선택)
4. 첫 배포 후 마이그레이션 한 번 실행:

   ```bash
   TURSO_URL=... TURSO_TOKEN=... npm run db:migrate
   ```

이후 `main` 브랜치 push 마다 자동 재배포.

> Render 무료 플랜: 15분 요청 없으면 sleep → 다음 요청 때 ~30초 cold start. 월 750시간.

## PWA (홈 화면에 추가)

Chrome 안드로이드에서 배포 URL 접속 → 우상단 ⋮ → **홈 화면에 추가** → 독립 앱 창으로 실행. iOS 사파리는 공유 → 홈 화면에 추가 (아이콘 다크 배경 + 흰 심볼).

## 데이터 인그레스

원격 에이전트는 `POST /api/reports/ingest` 로 리포트를 밀어넣는다.

- 헤더: `Authorization: Bearer <INGEST_API_KEY>`
- 바디: `ProductHuntResearchData` (see `src/lib/types.ts`) + optional `report_date`

## 주요 기능

### 대시보드 (`/`)

- 최신 리포트 hero 카드 (Top Pick + Fastest validation + CTA)
- 모멘텀 KPI 4개: 이번 주 서비스(±델타), 이번 주 테마(±델타), 새로 등장한 테마, 누적
- 주간 추이 라인 차트 (서비스/테마 이중 Y축)
- 반복 테마 (`ChipCloud` — 빈도 가중치)
- 반복 문제 정의 (`RankedList` — 넘버링)
- 시장 세그먼트 (`ThemeDistributionChart` — 스택 바 + 컬러 리스트)
- 지난 리포트 아카이브

### 상세 (`/report/[id]`)

- Fastest validation hero (accent 카드)
- 표본/테마/Top 아이디어/최대 시장 KPI
- **01 테마 분포** — 100% 스택 바 + 10색 팔레트 리스트
- **02 서비스** — 2열 카드 리스트, 테마 chip 필터(첫 테마 기본 선택), 정렬 텍스트 링크
- **03 공통 문제** — 2열 카드, 번호 배지
- **04 시장 규모** — 세그먼트별 2024→2030 dual bar (팔레트 색·CAGR·성장 배수), 한국 시장 맥락 상단
- **05 Top 5 아이디어** — 난이도×기회 산점도(사분면 shading + 스위트스팟 강조) + 랭킹 카드

### 서비스 아이콘 자동 리졸빙 (`/api/service-icon`)

리포트 데이터에 URL이 없어도 서비스 이름만으로 실제 로고 표시. 302 redirect 방식, 메모리 LRU 캐시(성공 24h·실패 30m).

우선순위:

1. `iconUrl` 필드 (에이전트가 채우면 우선)
2. **PH GraphQL API** (`PH_TOKEN` env 있으면) — 이름 → slug 후보 → `post(slug:...)` 로 thumbnail 조회
3. **Wayback Machine** — `web.archive.org/web/2/producthunt.com/products/{slug}` 캐시된 페이지의 JSON-LD `Product.image` 파싱 후 imgix 직접 URL 로 302. Cloudflare 봇 감지 우회
4. Google favicon (도메인 있을 때)
5. 이니셜 배지

Node fetch 가 Cloudflare TLS fingerprint 로 PH 직접 fetch 시 403 을 받아서 Wayback 프록시 채택.

## 디자인 시스템

Pretendard Variable 서체. 배경 `#faf9f6` (페이퍼), 잉크 `#0a0a0a`, accent `#059669`. 편집형 여백(섹션 간격 56px, 카드 padding 28px, radius 10px). `.display` / `.headline-tight` / `.eyebrow` 유틸.

폰트 최소 크기 12px 강제 (`.text-[10px]` 등 override), body 15px, `.text-xs` 13px.

시각화 팔레트: `emerald / cyan / violet / pink / orange / sky / lime / amber / indigo / rose` — 테마·세그먼트 구분용 10색.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- Turso libSQL (SQLite over the wire)
- recharts (LineChart, ScatterChart — 나머지 시각화는 커스텀 컴포넌트)
- Render 무료 티어 web service

## 히스토리

- **2026-07-10** Prism 브랜딩 + PWA 지원 + 로그인 제거
- **2026-07-10** 디자인·정보위계 전면 개편 (Mobbin 톤) + PH 아이콘 자동 리졸버
- **2026-07-09** 디자인 폴리싱 (MengTo/Skills 지침 기반) + Pretendard + 최소 12px
- **2026-07-08** 사용자 요청 레이아웃으로 상세 페이지 재구성 + 스키마 재구성
- **2026-07-07** recharts 도입 + 시각화 확장
- **2026-07-07** 전면 대시보드 개편: PH Weekly Research 전용
- **2026-07-06** 노트 템플릿 기능 추가: 주간 Product Hunt 리서치 템플릿
- **초기** Evernote 스타일 메모장 (Notepad) — 이후 PH Weekly Research 로 피벗
