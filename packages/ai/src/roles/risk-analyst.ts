export interface RiskAnalysisResult {
  riskScore: number; // 0 to 1
  flagged: boolean;
  anomalyReasons: string[];
}

export function analyzeJoinRisk(
  joinsInLastMinute: number,
  isKnownFraudPayer: boolean,
): RiskAnalysisResult {
  const reasons: string[] = [];
  if (joinsInLastMinute > 30) {
    reasons.push('High burst of automated join activity detected in a short time window.');
  }
  if (isKnownFraudPayer) {
    reasons.push('Payer identifier is associated with chargeback history.');
  }

  const flagged = reasons.length > 0;
  return {
    riskScore: flagged ? 0.85 : 0.05,
    flagged,
    anomalyReasons: reasons,
  };
}
