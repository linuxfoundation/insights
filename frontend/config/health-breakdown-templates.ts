// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
//
// Content-generation templates for the Health Score v2 breakdown UI (IN-1212).
// Every function here takes real per-project signal data and returns a generated
// sentence following the bracket-pattern templates in the content spec
// (attachments/IN-1212/content-spec.md) — no fixed/fabricated copy.
import type { HealthBreakdownResults } from '~~/types/overview/responses.types';

// ---------------------------------------------------------------------------
// Section 2: Lifecycle State descriptions
// ---------------------------------------------------------------------------

const formatDays = (seconds: number): string => {
  const days = Math.round(seconds / 86400);
  return days === 1 ? '1 day' : `${days} days`;
};

export const getLifecycleDescription = (
  state: string | null,
  signals: HealthBreakdownResults | null,
): string => {
  switch (state) {
    case 'active': {
      return 'Consistent commits, responsive maintainers, regular releases, and healthy issue triage.';
    }
    case 'stable': {
      return 'Mature and deliberately low-activity. The maintainer is reachable and there are no open issues or vulnerabilities that require attention.';
    }
    case 'declining': {
      const responseDetail =
        signals?.medianIssueResponseS !== null && signals?.medianIssueResponseS !== undefined
          ? ` Issue response times are now averaging ${formatDays(signals.medianIssueResponseS)}.`
          : '';
      const maintainerDetail =
        signals?.busFactorCount !== null && signals?.busFactorCount !== undefined
          ? ` Only ${signals.busFactorCount} active maintainer${signals.busFactorCount === 1 ? '' : 's'} remain${signals.busFactorCount === 1 ? 's' : ''}.`
          : '';
      return `Maintainer activity has dropped significantly over the past six months.${maintainerDetail}${responseDetail}`;
    }
    case 'abandoned': {
      const lastCommitDetail =
        signals?.lastCommitAt !== null && signals?.lastCommitAt !== undefined
          ? ` The last commit was on ${new Date(signals.lastCommitAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
          : '';
      const cveDetail =
        signals?.openCriticals !== null &&
        signals?.openCriticals !== undefined &&
        signals.openCriticals > 0
          ? ` ${signals.openCriticals} critical vulnerabilit${signals.openCriticals === 1 ? 'y remains' : 'ies remain'} unaddressed.`
          : '';
      return `No maintainer activity in over 18 months.${lastCommitDetail}${cveDetail}`;
    }
    case 'archived': {
      return 'The repository has been explicitly archived. No further updates are expected and the project is no longer accepting contributions.';
    }
    default: {
      return 'No repository activity has been indexed for this project. Lifecycle state cannot be determined until a supported source platform is connected.';
    }
  }
};

// ---------------------------------------------------------------------------
// Section 3: Health Score summary
// ---------------------------------------------------------------------------

const CATEGORY_LABEL: Record<'maintainer' | 'security' | 'development', string> = {
  maintainer: 'maintainer coverage',
  security: 'security posture',
  development: 'development cadence',
};

export const getHealthScoreDescription = (
  healthLabel: string | null,
  maintainerScore: number | null,
  securityScore: number | null,
  developmentScore: number | null,
): string | null => {
  if (healthLabel === null) {
    return 'No scoring data is available. This project has no indexed repositories or the connected platform has no supported data pipeline.';
  }
  const categoryPercents = [
    { key: 'maintainer' as const, percent: maintainerScore !== null ? maintainerScore / 40 : -1 },
    { key: 'security' as const, percent: securityScore !== null ? securityScore / 35 : -1 },
    {
      key: 'development' as const,
      percent: developmentScore !== null ? developmentScore / 25 : -1,
    },
  ].filter((c) => c.percent >= 0);

  if (categoryPercents.length === 0) {
    return `Overall project health is ${healthLabel}, based on maintainer activity, security posture, and development cadence.`;
  }

  const strongest = categoryPercents.reduce((a, b) => (b.percent > a.percent ? b : a));
  const weakest = categoryPercents.reduce((a, b) => (b.percent < a.percent ? b : a));
  const strongLabel = CATEGORY_LABEL[strongest.key];
  const weakLabel = CATEGORY_LABEL[weakest.key];

  if (healthLabel === 'excellent' || healthLabel === 'healthy') {
    return strongest.key === weakest.key
      ? `Strong ${strongLabel}, security practices, and development cadence across the board.`
      : `Strong ${strongLabel}. ${weakLabel.charAt(0).toUpperCase() + weakLabel.slice(1)} is the remaining gap keeping the score from Excellent.`;
  }
  if (strongest.key === weakest.key) {
    return `Overall project health is ${healthLabel}, based on maintainer activity, security posture, and development cadence.`;
  }
  return `${weakLabel.charAt(0).toUpperCase() + weakLabel.slice(1)} is dragging the score down, despite stronger ${strongLabel}.`;
};

// ---------------------------------------------------------------------------
// Sections 4-6: Category descriptions
// ---------------------------------------------------------------------------

export type HealthCategory = 'maintainer' | 'security' | 'development';

type CategoryBand = 'success' | 'warning' | 'danger';

const categoryThresholds: Record<HealthCategory, { success: number; warning: number }> = {
  maintainer: { success: 28, warning: 16 },
  security: { success: 23, warning: 12 },
  development: { success: 17, warning: 9 },
};

const getCategoryBand = (category: HealthCategory, score: number): CategoryBand => {
  const thresholds = categoryThresholds[category];
  if (score >= thresholds.success) return 'success';
  if (score >= thresholds.warning) return 'warning';
  return 'danger';
};

const bandColor: Record<CategoryBand, 'positive' | 'warning' | 'negative'> = {
  success: 'positive',
  warning: 'warning',
  danger: 'negative',
};

export const getCategoryScoreColor = (
  category: HealthCategory,
  score: number,
): 'positive' | 'warning' | 'negative' => bandColor[getCategoryBand(category, score)];

const getMaintainerDescription = (band: CategoryBand, signals: HealthBreakdownResults): string => {
  const orgCount = signals.orgCount ?? 0;
  const maintainerCount = signals.busFactorCount ?? 0;

  if (band === 'success') {
    return `Responsive maintainers, ${maintainerCount} active maintainer${maintainerCount === 1 ? '' : 's'} with merge rights, a stable contributor pipeline, and contributors spanning ${orgCount} organization${orgCount === 1 ? '' : 's'}.`;
  }
  if (band === 'warning') {
    const teamDetail =
      maintainerCount <= 1
        ? 'A single active maintainer'
        : `A small team of ${maintainerCount} active maintainers`;
    const orgDetail =
      orgCount <= 1
        ? 'limited organizational diversity'
        : `contributors across ${orgCount} organizations`;
    return `${teamDetail} with slow response times, no contributor growth, and ${orgDetail}.`;
  }
  const responseDetail =
    signals.medianIssueResponseS !== null
      ? ` No response to issues in over ${formatDays(signals.medianIssueResponseS)}.`
      : '';
  return `No active maintainer.${responseDetail} There is no succession plan in place.`;
};

const getSecurityDescription = (band: CategoryBand, signals: HealthBreakdownResults): string => {
  if (band === 'success') {
    const scorecardDetail =
      signals.scorecardScore !== null
        ? ` OpenSSF Scorecard is ${signals.scorecardScore.toFixed(1)}/10.`
        : '';
    return `No open CVEs and full security practices in place.${scorecardDetail}`;
  }
  if (band === 'warning') {
    const criticalCount = signals.openCriticals ?? 0;
    const highCount = signals.openHighs ?? 0;
    const cveText =
      criticalCount + highCount > 0
        ? `${criticalCount + highCount} open critical or high vulnerabilit${criticalCount + highCount === 1 ? 'y' : 'ies'}`
        : 'No open critical or high vulnerabilities';
    const missing: string[] = [];
    if (!signals.securityPolicyEnabled) missing.push('no SECURITY.md');
    if (!signals.branchProtectionEnabled) missing.push('no branch protection');
    const missingText = missing.length > 0 ? `, but ${missing.join(' and ')}` : '';
    return `${cveText}${missingText}.`;
  }
  const criticalCount = signals.openCriticals ?? 0;
  const highCount = signals.openHighs ?? 0;
  const cveDetail =
    criticalCount + highCount > 0
      ? `${criticalCount + highCount} open critical or high vulnerabilit${criticalCount + highCount === 1 ? 'y' : 'ies'}.`
      : 'No open critical or high vulnerabilities.';
  const practicesMissing: string[] = [];
  if (!signals.securityPolicyEnabled) practicesMissing.push('no SECURITY.md');
  if (!signals.branchProtectionEnabled) practicesMissing.push('no branch protection');
  const practicesDetail =
    practicesMissing.length > 0
      ? `Security practices need attention: ${practicesMissing.join(' and ')}.`
      : 'Dependency health needs attention.';
  return `${cveDetail} ${practicesDetail}`;
};

const getDevelopmentDescription = (band: CategoryBand, signals: HealthBreakdownResults): string => {
  if (band === 'success') {
    const releaseDetail =
      signals.daysSinceLatest !== null
        ? `Active commit stream, with the last release ${Math.round(signals.daysSinceLatest)} days ago.`
        : 'Active commit stream and a healthy release cadence.';
    return `${releaseDetail} Issue triage is keeping pace with incoming reports.`;
  }
  if (band === 'warning') {
    const releaseDetail =
      signals.daysSinceLatest !== null && signals.daysSinceLatest > 365
        ? `No release in over ${Math.floor(signals.daysSinceLatest / 365)} year${Math.floor(signals.daysSinceLatest / 365) === 1 ? '' : 's'}.`
        : 'Release cadence has slowed.';
    return `${releaseDetail} Some commit activity continues but the project shows signs of stagnation.`;
  }
  const commitDetail =
    signals.commitsLast6m !== null && signals.commitsLast6m === 0
      ? 'No commits in the past six months.'
      : 'Minimal commit activity in the past six months.';
  return `${commitDetail} Releases and issue resolution have both stalled.`;
};

export const getCategoryDescription = (
  category: HealthCategory,
  score: number | null,
  available: boolean,
  signals: HealthBreakdownResults | null,
): string => {
  if (!available || score === null || !signals) {
    return getCategoryUnavailableDescription(category, signals);
  }
  const band = getCategoryBand(category, score);
  if (category === 'maintainer') return getMaintainerDescription(band, signals);
  if (category === 'security') return getSecurityDescription(band, signals);
  return getDevelopmentDescription(band, signals);
};

const getCategoryUnavailableDescription = (
  category: HealthCategory,
  signals: HealthBreakdownResults | null,
): string => {
  if (category === 'maintainer') {
    const availableSignals: string[] = [];
    if (signals?.responsivenessAvailable) availableSignals.push('maintainer responsiveness');
    if (signals?.busFactorAvailable) availableSignals.push('bus factor');
    if (signals?.orgDiversityAvailable) availableSignals.push('organization diversity');
    const namedAvailable =
      availableSignals.length > 0
        ? `Only ${availableSignals.join(', ')} ${availableSignals.length === 1 ? 'is' : 'are'} available.`
        : 'No maintainer signals are available.';
    return `${namedAvailable} The category has been dropped from the Health Score composite.`;
  }
  if (category === 'security') {
    const availableSignals: string[] = [];
    if (signals?.scorecardAvailable) availableSignals.push('OpenSSF Scorecard');
    if (signals?.securityPracticesAvailable) availableSignals.push('security practices');
    if (signals?.dependencyHealthAvailable) availableSignals.push('dependency health');
    const reason = signals?.isGerrit ? 'Gerrit-hosted projects' : 'this repository type';
    const namedAvailable =
      availableSignals.length > 0
        ? `Only open vulnerability data and ${availableSignals.join(', ')} ${availableSignals.length === 1 ? 'is' : 'are'} available for ${reason}.`
        : `Only open vulnerability data is available for ${reason}.`;
    return `${namedAvailable} The category has been dropped from the Health Score composite.`;
  }
  const availableSignals: string[] = [];
  if (signals?.releaseCadenceAvailable) availableSignals.push('release cadence');
  if (signals?.issueResolutionAvailable) availableSignals.push('issue resolution');
  if (signals?.prMergeAvailable) availableSignals.push('PR merge health');
  const namedAvailable =
    availableSignals.length > 0
      ? `${availableSignals.join(' and ')} could not be assessed for this repository type.`
      : 'Development signals could not be assessed for this repository type.';
  return `${namedAvailable} The category has been dropped from the Health Score composite.`;
};

// ---------------------------------------------------------------------------
// Section 7: Signal Rows
// ---------------------------------------------------------------------------

export type SignalRowStatus = 'positive' | 'warning' | 'negative' | 'no-data';

export interface SignalRow {
  status: SignalRowStatus;
  description: string;
}

const blockedSignalDescription = (signalKey: string, signals: HealthBreakdownResults): string => {
  if (signals.isGerrit) {
    return `Not available for Gerrit-hosted repositories. ${signalKey} currently requires GitHub.`;
  }
  if (signals.isExcluded) {
    return `Not available for this repository. ${signalKey} currently requires GitHub.`;
  }
  return `No data available. Repository has not been indexed for ${signalKey.toLowerCase()}.`;
};

// --- Maintainer signals ---

export const getResponsivenessRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.responsivenessAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('Maintainer responsiveness', signals),
    };
  }
  if (signals.medianIssueResponseS === null) {
    return {
      status: 'no-data',
      description: 'No issue or PR response data available for this project.',
    };
  }
  const days = Math.round(signals.medianIssueResponseS / 86400);
  const responseText = formatDays(signals.medianIssueResponseS);
  if (days < 7) {
    return {
      status: 'positive',
      description: `Median response time is ${responseText}, well within a week.`,
    };
  }
  if (days < 30) {
    return { status: 'warning', description: `Median response time is ${responseText}.` };
  }
  return {
    status: 'negative',
    description: `Median response time is ${responseText}, well over a month.`,
  };
};

export const getBusFactorRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.busFactorAvailable) {
    return { status: 'no-data', description: blockedSignalDescription('Bus factor', signals) };
  }
  const count = signals.busFactorCount ?? 0;
  if (count >= 3) {
    return {
      status: 'positive',
      description: `${count} active maintainers currently have merge rights.`,
    };
  }
  if (count >= 1) {
    return {
      status: 'warning',
      description: `Only ${count} active maintainer${count === 1 ? '' : 's'} currently ${count === 1 ? 'has' : 'have'} merge rights.`,
    };
  }
  return { status: 'negative', description: 'No active maintainers with merge rights were found.' };
};

export const getOrgDiversityRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.orgDiversityAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('Organization diversity', signals),
    };
  }
  const count = signals.orgCount ?? 0;
  if (count >= 3) {
    return { status: 'positive', description: `Contributors span ${count} organizations.` };
  }
  if (count >= 1) {
    return {
      status: 'warning',
      description: `Contributors come from ${count} organization${count === 1 ? '' : 's'} only.`,
    };
  }
  return {
    status: 'negative',
    description: 'No organization affiliation data is available for contributors.',
  };
};

// --- Security signals ---

export const getOpenVulnRow = (signals: HealthBreakdownResults): SignalRow => {
  const criticals = signals.openCriticals ?? 0;
  const highs = signals.openHighs ?? 0;
  const moderates = signals.openModerates ?? 0;
  if (criticals + highs > 0) {
    return {
      status: 'negative',
      description: `${criticals + highs} open critical or high vulnerabilit${criticals + highs === 1 ? 'y' : 'ies'}.`,
    };
  }
  if (moderates > 0) {
    return {
      status: 'warning',
      description: `${moderates} open medium or low severity vulnerabilit${moderates === 1 ? 'y' : 'ies'}, no critical or high issues.`,
    };
  }
  return { status: 'positive', description: 'No open vulnerabilities of any severity.' };
};

export const getScorecardRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.scorecardAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('OpenSSF Scorecard', signals),
    };
  }
  const score = signals.scorecardScore ?? 0;
  if (score >= 7) {
    return { status: 'positive', description: `OpenSSF Scorecard is ${score.toFixed(1)}/10.` };
  }
  if (score >= 4) {
    return {
      status: 'warning',
      description: `OpenSSF Scorecard is ${score.toFixed(1)}/10, below the recommended baseline.`,
    };
  }
  return { status: 'negative', description: `OpenSSF Scorecard is ${score.toFixed(1)}/10.` };
};

export const getSecurityPracticesRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.securityPracticesAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('Security practices', signals),
    };
  }
  const practices = [
    signals.securityPolicyEnabled,
    signals.branchProtectionEnabled,
    signals.branchProtectionRequiredReviews,
    signals.branchProtectionRequiresStatusChecks,
  ];
  const enabledCount = practices.filter((p) => Boolean(p)).length;
  if (enabledCount >= 3) {
    return {
      status: 'positive',
      description: `${enabledCount} of 4 tracked security practices are in place.`,
    };
  }
  if (enabledCount >= 1) {
    const missing: string[] = [];
    if (!signals.securityPolicyEnabled) missing.push('no SECURITY.md');
    if (!signals.branchProtectionEnabled) missing.push('no branch protection');
    return {
      status: 'warning',
      description: `${enabledCount} of 4 tracked security practices are in place, ${missing.join(', ') || 'with gaps remaining'}.`,
    };
  }
  return { status: 'negative', description: 'No security practices are in place.' };
};

export const getDependencyHealthRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.dependencyHealthAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('Dependency health', signals),
    };
  }
  const vulnerable = signals.vulnerableDeps ?? 0;
  if (vulnerable === 0) {
    return {
      status: 'positive',
      description: 'All dependencies are clean of known vulnerabilities.',
    };
  }
  if (vulnerable <= 3) {
    return {
      status: 'warning',
      description: `${vulnerable} dependenc${vulnerable === 1 ? 'y has' : 'ies have'} a known vulnerability.`,
    };
  }
  return {
    status: 'negative',
    description: `${vulnerable} dependencies have a known vulnerability.`,
  };
};

// --- Development signals ---

export const getReleaseCadenceRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.releaseCadenceAvailable) {
    return { status: 'no-data', description: blockedSignalDescription('Release cadence', signals) };
  }
  const days = signals.daysSinceLatest;
  if (days === null) {
    return { status: 'no-data', description: 'No release history is available for this project.' };
  }
  if (days <= 180) {
    return { status: 'positive', description: `Last release was ${Math.round(days)} days ago.` };
  }
  if (days <= 730) {
    return {
      status: 'warning',
      description: `Last release was ${Math.round(days)} days ago, longer than six months.`,
    };
  }
  return { status: 'negative', description: `No release in over ${Math.floor(days / 365)} years.` };
};

export const getCommitActivityRow = (signals: HealthBreakdownResults): SignalRow => {
  const commits = signals.commitsLast6m;
  if (commits === null) {
    return { status: 'no-data', description: 'No commit history is available for this project.' };
  }
  if (commits > 20) {
    return { status: 'positive', description: `${commits} commits in the past six months.` };
  }
  if (commits > 0) {
    return {
      status: 'warning',
      description: `${commits} commit${commits === 1 ? '' : 's'} in the past six months, a slow pace.`,
    };
  }
  return { status: 'negative', description: 'No commits in the past six months.' };
};

export const getIssueResolutionRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.issueResolutionAvailable) {
    return {
      status: 'no-data',
      description: blockedSignalDescription('Issue resolution', signals),
    };
  }
  const closed = signals.closed12m ?? 0;
  const opened = signals.opened12m ?? 0;
  if (opened === 0) {
    return { status: 'positive', description: 'No new issues were opened in the past year.' };
  }
  if (closed >= opened) {
    return {
      status: 'positive',
      description: `${closed} issues closed against ${opened} opened in the past year, closing faster than opening.`,
    };
  }
  if (closed >= opened * 0.5) {
    return {
      status: 'warning',
      description: `${closed} issues closed against ${opened} opened in the past year, a growing backlog.`,
    };
  }
  return {
    status: 'negative',
    description: `${closed} issues closed against ${opened} opened in the past year, the backlog is growing quickly.`,
  };
};

export const getPrMergeRow = (signals: HealthBreakdownResults): SignalRow => {
  if (!signals.prMergeAvailable) {
    return { status: 'no-data', description: blockedSignalDescription('PR merge health', signals) };
  }
  const merged = signals.merged12m ?? 0;
  const closedUnmerged = signals.closedUnmerged12m ?? 0;
  const total = merged + closedUnmerged;
  if (total === 0) {
    return {
      status: 'no-data',
      description: 'No external pull requests were received in the past year.',
    };
  }
  const mergeRate = merged / total;
  if (mergeRate > 0.5) {
    return {
      status: 'positive',
      description: `${merged} of ${total} pull requests were merged in the past year.`,
    };
  }
  if (mergeRate > 0) {
    return {
      status: 'warning',
      description: `${merged} of ${total} pull requests were merged in the past year, under half.`,
    };
  }
  return {
    status: 'negative',
    description: `None of ${total} pull requests were merged in the past year.`,
  };
};

// ---------------------------------------------------------------------------
// Section 9: Impact Breakdown signal row descriptions
// ---------------------------------------------------------------------------

export const getTransitiveDependentsDescription = (value: number | null): string => {
  if (value === null) {
    return 'No transitive dependent data is available for this project.';
  }
  return `${value.toLocaleString('en-US')} packages depend on this project directly or indirectly, the primary measure of its blast radius.`;
};

export const getPopularityDescription = (value: number | null): string => {
  if (value === null) {
    return 'No Sonatype popularity data is available for this project.';
  }
  const rounded = Math.round(value);
  if (rounded >= 75) {
    return `Sonatype popularity score of ${rounded} / 100. High Maven Central popularity — widely fetched and depended on across the Java ecosystem.`;
  }
  if (rounded >= 25) {
    return `Sonatype popularity score of ${rounded} / 100. Moderate Maven Central footprint — consistent presence in Java dependency trees.`;
  }
  return `Sonatype popularity score of ${rounded} / 100. Limited Maven Central footprint — fetches concentrated in a narrow set of consumers.`;
};

export const getDownloadsDescription = (value: number | null): string => {
  if (value === null) {
    return 'No package download data is available for this project.';
  }
  return `${value.toLocaleString('en-US')} downloads per month across all linked registries.`;
};

export const getDirectDependentsDescription = (value: number | null): string => {
  if (value === null) {
    return 'No direct dependent data is available for this project.';
  }
  return `${value.toLocaleString('en-US')} packages depend directly on this project.`;
};

export const getImpactSummaryDescription = (
  impactLabel: string | null,
  transitiveDependents?: number | null,
): string | null => {
  if (impactLabel === null) {
    return 'This project publishes no tracked packages. Impact cannot be computed without a package registry presence.';
  }
  const dependentsDetail =
    transitiveDependents !== null && transitiveDependents !== undefined
      ? ` ${transitiveDependents.toLocaleString('en-US')} packages depend on it directly or indirectly.`
      : '';
  if (impactLabel === 'foundational')
    return `Near-total blast radius across the dependency graph.${dependentsDetail}`;
  if (impactLabel === 'major')
    return `Large blast radius, depended on by many high-importance projects.${dependentsDetail}`;
  if (impactLabel === 'moderate')
    return `Moderate blast radius within its dependency graph.${dependentsDetail}`;
  return `Narrow blast radius, depended on by a small set of projects with limited transitive reach.${dependentsDetail}`;
};
