import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ProductHuntResearchData, WeeklyReportSummary } from "@/lib/types";

function emptyData(): ProductHuntResearchData {
  return {
    collectionSummary: "",
    themes: [],
    commonalities: [],
    marketSize: { segments: [], koreaContext: "" },
    top5Opportunities: [],
    notes: "",
  };
}

export async function GET() {
  const { rows } = await db.execute({
    sql: `SELECT id, report_date, data, created_at
          FROM weekly_reports
          ORDER BY report_date DESC, created_at DESC
          LIMIT 200`,
    args: [],
  });

  const summaries: WeeklyReportSummary[] = rows.map((r) => {
    let data: ProductHuntResearchData;
    try {
      data = JSON.parse(String(r.data)) as ProductHuntResearchData;
    } catch {
      data = emptyData();
    }
    const themes = data.themes ?? [];
    const serviceCount = themes.reduce((sum, t) => sum + (t.services?.length ?? 0), 0);
    const top = data.top5Opportunities?.[0] ?? null;
    const fastest = data.fastestValidation;
    const fastestTitle = fastest
      ? data.top5Opportunities.find((o) => o.rank === fastest.targetRank)?.title ?? null
      : null;
    return {
      id: Number(r.id),
      report_date: String(r.report_date),
      collectionSummary: data.collectionSummary ?? "",
      themeCount: themes.length,
      serviceCount,
      themeNames: themes.map((t) => t.name).filter(Boolean),
      commonalityHeadlines: (data.commonalities ?? []).map((c) => c.headline).filter(Boolean),
      marketSegmentNames: (data.marketSize?.segments ?? []).map((s) => s.name).filter(Boolean),
      topOpportunityTitle: top?.title ?? null,
      topOpportunityStars: top?.difficultyStars ?? null,
      fastestValidationTitle: fastestTitle,
      created_at: Number(r.created_at),
    };
  });

  return NextResponse.json(summaries);
}
