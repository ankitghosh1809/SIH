import type { AxiosError } from "axios";
import { Info } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { RiskBadge } from "@/components/RiskBadge";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/routes";
import type {
  ExplainResponse,
  PredictionField,
  ReferralSuggestion,
  RiskLevel,
  ScanResponse,
} from "@/types/api";
import { apiUrl, useReferralSuggestion, useScanDetail, useScanExplain } from "./useScan";
import { formatPercent, formatTimestamp } from "./format";

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const scanQuery = useScanDetail(id);
  const explainQuery = useScanExplain(id);
  const referralQuery = useReferralSuggestion(id);

  const notFound =
    scanQuery.isError && (scanQuery.error as AxiosError)?.response?.status === 404;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Permanent screening-not-diagnosis disclaimer: rendered unconditionally,
          above the loading/error/success branches below, so it's visible in
          every state per the work order's Definition of Done. */}
      <ScreeningDisclaimer />

      <div className="mt-6">
        {scanQuery.isLoading ? (
          <DetailSkeleton />
        ) : scanQuery.isError ? (
          <ErrorState
            title={notFound ? "Scan not found" : "Couldn't load this scan"}
            description={
              notFound
                ? "This scan doesn't exist, or may have been removed."
                : "Check your connection and try again."
            }
            action={
              <Button asChild size="sm" variant="outline">
                <Link to={ROUTES.scanHistory}>Back to scan history</Link>
              </Button>
            }
          />
        ) : scanQuery.data ? (
          <ScanDetailContent
            scan={scanQuery.data}
            explain={explainQuery.data}
            explainLoading={explainQuery.isLoading}
            referral={referralQuery.data}
          />
        ) : null}
      </div>
    </div>
  );
}

function ScreeningDisclaimer() {
  return (
    <div className="flex gap-3 rounded-[var(--radius)] border border-border bg-muted/40 p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">
        This result is a screening aid, not a medical diagnosis. It estimates
        risk from an image analysis model and does not replace evaluation by
        a qualified eye care professional.
      </p>
    </div>
  );
}

function ScanDetailContent({
  scan,
  explain,
  explainLoading,
  referral,
}: {
  scan: ScanResponse;
  explain?: ExplainResponse;
  explainLoading: boolean;
  referral?: ReferralSuggestion;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Risk level</p>
            <div className="mt-1">
              <RiskBadge level={scan.risk_level} />
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Model {scan.model_version}</p>
            <p>{formatTimestamp(scan.created_at)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <RiskSummary level={scan.risk_level} />
        </CardContent>
      </Card>

      {referral?.suggested && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">Referral recommended</p>
              {referral.reason && (
                <p className="mt-1 text-sm text-muted-foreground">{referral.reason}</p>
              )}
            </div>
            <Button asChild>
              <Link to={ROUTES.scanReview(scan.scan_id)}>Review and refer</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="result">
        <TabsList>
          <TabsTrigger value="result">Result</TabsTrigger>
          <TabsTrigger value="explainability">Explainability</TabsTrigger>
        </TabsList>

        <TabsContent value="result" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Condition breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConditionRow
                label="Diabetic retinopathy"
                field={scan.prediction.diabetic_retinopathy}
              />
              <ConditionRow label="Cataract" field={scan.prediction.cataract} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={apiUrl(scan.heatmap_url)}
                alt={`Grad-CAM heatmap for scan ${scan.scan_id}`}
                className="w-full rounded-[var(--radius)] border border-border"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Model-generated visualization of the regions that most
                influenced this result, not a raw photo.
              </p>
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <a href={apiUrl(`/api/v1/scans/${scan.scan_id}/report`)} download>
              Download report (PDF)
            </a>
          </Button>
        </TabsContent>

        <TabsContent value="explainability">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {explainLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : explain ? (
                <>
                  <p className="text-sm text-foreground">{explain.explanation_text}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">DR uncertainty</p>
                      <p className="font-medium text-foreground">
                        {formatPercent(explain.dr_uncertainty)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cataract uncertainty</p>
                      <p className="font-medium text-foreground">
                        {formatPercent(explain.cataract_uncertainty)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Explanation isn't available for this scan right now.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RiskSummary({ level }: { level: RiskLevel }) {
  const copy: Record<RiskLevel, string> = {
    high: "Elevated risk detected for one or more conditions. Clinical follow-up is recommended.",
    medium: "Some risk indicators were detected. Consider discussing this result with a doctor.",
    low: "No significant risk indicators were detected in this screening. Routine eye checkups are still recommended.",
  };
  return <p className="text-sm text-muted-foreground">{copy[level]}</p>;
}

function ConditionRow({ label, field }: { label: string; field: PredictionField }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {field.positive ? "Indicators detected" : "No indicators detected"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">
          {formatPercent(field.probability)}
        </p>
        {field.uncertainty != null && (
          <p className="text-xs text-muted-foreground">
            {formatPercent(field.uncertainty)} uncertainty
          </p>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
