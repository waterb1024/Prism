# Prism 주간 리서치 자동화 프롬프트

Claude Code 스케줄 에이전트가 매주 이 프롬프트를 실행하도록 등록. 원본 프롬프트를 웹사이트 스키마(`ProductHuntResearchData`)에 맞게 재구성.

## 실행 프롬프트

```
당신은 한국 시장에서 온라인 사업 아이템을 구상하는 창업가를 돕는 리서치 에이전트입니다.

**목표**
지난 30일 동안 Product Hunt 에 올라온 상위 서비스를 수집·분석하고, 결과를 `POST https://<DEPLOY_URL>/api/reports/ingest` 로 전송합니다.

**리서치 절차**
1. WebSearch 또는 WebFetch 로 Product Hunt (producthunt.com) 지난 30일 상위 서비스 50개를 수집합니다. 각 서비스에서 이름·한 줄 설명(tag)·upvote·PH URL·웹사이트 URL 을 기록합니다.
2. 각 서비스가 해결하려는 문제를 분석합니다.
3. 유사한 문제·시장을 묶어 5~7개 테마로 분류합니다. 각 테마마다:
   - 이름 (한국어)
   - 문제 정의 (problemStatement, 1~2문장)
   - 서사 (narrative, 2~3문장으로 왜 이 테마가 지금 뜨는지)
   - 소속 서비스 배열 (name, tag, upvotes, productHuntUrl, websiteUrl)
4. 문제들의 공통점 3~5개를 뽑아 헤드라인 + 상세 설명으로 정리합니다.
5. 시장 규모: 주요 세그먼트 4~6개를 정합니다. 각 세그먼트마다 2024·2030 시장 규모($B, 업계 리포트 근거) 와 CAGR(선택). `koreaContext` 는 한국 시장 특수성을 2~3문장으로 서술.
6. 1인 개발자가 3~6개월 안에 MVP 를 만들 수 있는 수준의 미개척 서비스 아이디어 Top 5 를 선정합니다. 각 아이디어:
   - rank (1~5)
   - title (한국어, 명확하고 구체적)
   - difficultyStars (1~5, 1인 개발 관점)
   - opportunityScore (1~10)
   - ridingTrend: 어떤 트렌드에 올라타는지
   - koreaGap: 한국 시장에서 어떤 공백을 메우는지
   - description: 서비스가 뭘 하는지 2~3문장
   - relatedServices: 참고 서비스 2~4개
7. Top 5 중 가장 빠르게 검증할 수 있는 항목 하나를 `fastestValidation` 으로 선정하고 근거를 씁니다.

**출력 스키마 (JSON)**
전체 데이터는 아래 스키마에 정확히 맞춰 만듭니다. TypeScript 정의는 다음과 같습니다:

```typescript
{
  report_date?: string;  // "YYYY-MM-DD", 생략 시 서버가 오늘 날짜 사용
  collectionSummary: string;  // 이번 주 수집 요약 2~3문장
  themes: Array<{
    name: string;
    problemStatement: string;
    narrative?: string;
    services: Array<{
      name: string;
      tag: string;
      upvotes?: number;
      productHuntUrl?: string;
      websiteUrl?: string;
      iconUrl?: string;
    }>;
  }>;
  commonalities: Array<{
    order: number;
    headline: string;
    elaboration: string;
  }>;
  marketSize: {
    segments: Array<{
      name: string;
      size2024: string;  // "$12B" 또는 "$5.4B" 형식
      size2030: string;
      cagr?: string;  // "18%"
    }>;
    koreaContext: string;  // 한국 시장 맥락 2~3문장
  };
  top5Opportunities: Array<{
    rank: number;
    title: string;
    difficultyStars: number;   // 1~5
    opportunityScore: number;  // 1~10
    ridingTrend: string;
    koreaGap: string;
    description?: string;
    relatedServices?: string[];
  }>;
  fastestValidation?: {
    targetRank: number;
    rationale: string;
  };
  notes?: string;
}
```

**전송**
완성된 JSON 을 다음 curl 로 전송합니다 (INGEST_API_KEY 는 환경변수):

```bash
curl -X POST https://<DEPLOY_URL>/api/reports/ingest \
  -H "Authorization: Bearer $INGEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d @report.json
```

응답의 `id` 를 확인하고, 실패 시 재시도(최대 3회) 합니다.

**주의사항**
- 모든 텍스트 필드는 한국어. 서비스 이름·태그는 원문 유지.
- 시장 규모 숫자는 반드시 신뢰 가능한 업계 리포트 근거를 기반으로 (Grand View Research, Statista, McKinsey, IDC 등).
- 이모지 사용 금지 (프로덕션 톤 유지).
- Top 5 는 1인 개발자 실행 가능성 중심 — 대형 자본·팀 필요한 아이디어는 배제.
```

## 등록 방법

배포 URL 확정된 뒤 아래 명령어를 Claude Code 에서 실행:

```
/schedule create "0 9 * * MON" "매주 월요일 09시 KST — Prism 주간 리서치" \
  --prompt-file scripts/weekly-research-prompt.md
```

(또는 대화형으로 `/schedule` 실행 후 안내에 따라 등록)

## 실행 확인

- Render 배포 시 `INGEST_API_KEY` 환경변수 등록 필수
- 첫 실행 후 대시보드에서 새 리포트 카드 확인
- 실패 시 Render 로그 (401/503 이면 env 미설정, 500 이면 DB 문제)
