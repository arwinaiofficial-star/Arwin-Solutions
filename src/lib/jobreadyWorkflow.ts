import type { GeneratedCV } from "@/context/AuthContext";

export type WorkflowStageStatus = "locked" | "ready" | "in_progress" | "complete";
export type WorkflowView = "home" | "resume" | "jobs" | "tailor" | "tracker" | "settings";
export type WorkflowTrackedStatus = "saved" | "applied" | "interview" | "offer";

export interface WorkflowStage {
  id: string;
  view: WorkflowView;
  resumeStep?: number;
  label: string;
  shortLabel: string;
  description: string;
  status: WorkflowStageStatus;
  unlocked: boolean;
  complete: boolean;
  blocker?: string;
  evidence?: string;
}

export interface WorkflowJobRef {
  id: string;
  title: string;
  company: string;
  location?: string;
}

export interface WorkflowTrackedJobRef {
  title: string;
  company: string;
  status: WorkflowTrackedStatus;
  notes?: string;
}

export interface ResumeDraftProgress {
  hasAnyData: boolean;
  hasCoreIdentity: boolean;
  summaryReady: boolean;
  skillsCount: number;
  experienceCount: number;
  educationCount: number;
}

export interface WorkflowComputationInput {
  savedResume?: GeneratedCV | null;
  resumeDraft: Record<string, unknown>;
  atsBaselineComplete: boolean;
  matchedJobsCount: number;
  selectedJob: WorkflowJobRef | null;
  trackedTarget: WorkflowTrackedJobRef | null;
  trackedJobsCount: number;
  coverLetterText: string;
  coverLetterJobId: string | null;
  tailoredResumeJobId: string | null;
}

export interface WorkflowComputationResult {
  stages: WorkflowStage[];
  nextRecommendedStage: WorkflowStage;
  importComplete: boolean;
  strengthenContentReady: boolean;
  tailorComplete: boolean;
  hasAppliedTarget: boolean;
  trackComplete: boolean;
  savedSkillsCount: number;
  savedExperienceCount: number;
  savedEducationCount: number;
  savedHighlightCount: number;
  draftProgress: ResumeDraftProgress;
}

export function hasWorkflowText(value: string | null | undefined, min = 1): boolean {
  return Boolean(value && value.trim().length >= min);
}

function countMeaningfulCvExperience(cvData?: GeneratedCV | null): number {
  return cvData?.experience?.filter((entry) =>
    hasWorkflowText(entry.title) ||
    hasWorkflowText(entry.company) ||
    entry.highlights.some((highlight) => hasWorkflowText(highlight))
  ).length || 0;
}

function countMeaningfulCvEducation(cvData?: GeneratedCV | null): number {
  return cvData?.education?.filter((entry) =>
    hasWorkflowText(entry.degree) || hasWorkflowText(entry.institution)
  ).length || 0;
}

function countCvHighlights(cvData?: GeneratedCV | null): number {
  return cvData?.experience
    ?.flatMap((entry) => entry.highlights || [])
    .filter((highlight) => hasWorkflowText(highlight, 8))
    .length || 0;
}

function countDraftItems(
  value: unknown,
  matcher: (item: Record<string, unknown>) => boolean,
): number {
  if (!Array.isArray(value)) return 0;
  return value.filter((item) => typeof item === "object" && item !== null && matcher(item as Record<string, unknown>)).length;
}

export function getResumeDraftProgress(draft: Record<string, unknown>): ResumeDraftProgress {
  const fullName = typeof draft.fullName === "string" ? draft.fullName : "";
  const email = typeof draft.email === "string" ? draft.email : "";
  const location = typeof draft.location === "string" ? draft.location : "";
  const summary = typeof draft.summary === "string" ? draft.summary : "";
  const skills = Array.isArray(draft.skills)
    ? draft.skills.filter((skill) => typeof skill === "string" && hasWorkflowText(skill))
    : [];
  const experiences = countDraftItems(draft.experiences, (item) =>
    hasWorkflowText(String(item.title || "")) ||
    hasWorkflowText(String(item.company || "")) ||
    (Array.isArray(item.highlights) && item.highlights.some((highlight) => typeof highlight === "string" && hasWorkflowText(highlight)))
  );
  const education = countDraftItems(draft.education, (item) =>
    hasWorkflowText(String(item.degree || "")) || hasWorkflowText(String(item.institution || ""))
  );

  return {
    hasAnyData: hasWorkflowText(fullName) || hasWorkflowText(email) || hasWorkflowText(location) || hasWorkflowText(summary) || skills.length > 0 || experiences > 0 || education > 0,
    hasCoreIdentity: hasWorkflowText(fullName) && hasWorkflowText(email) && hasWorkflowText(location),
    summaryReady: hasWorkflowText(summary, 60),
    skillsCount: skills.length,
    experienceCount: experiences,
    educationCount: education,
  };
}

export function computeJobReadyWorkflow(input: WorkflowComputationInput): WorkflowComputationResult {
  const draftProgress = getResumeDraftProgress(input.resumeDraft);
  const savedSkillsCount = input.savedResume?.skills?.filter((skill) => hasWorkflowText(skill)).length || 0;
  const savedExperienceCount = countMeaningfulCvExperience(input.savedResume);
  const savedEducationCount = countMeaningfulCvEducation(input.savedResume);
  const savedHighlightCount = countCvHighlights(input.savedResume);

  const importComplete = Boolean(
    input.savedResume &&
    hasWorkflowText(input.savedResume.personalInfo?.name) &&
    hasWorkflowText(input.savedResume.personalInfo?.email) &&
    hasWorkflowText(input.savedResume.personalInfo?.location) &&
    (savedExperienceCount > 0 || savedEducationCount > 0)
  );

  const strengthenContentReady = importComplete &&
    hasWorkflowText(input.savedResume?.summary, 60) &&
    savedSkillsCount >= 5 &&
    savedHighlightCount >= 3;

  const hasSelectedJob = Boolean(input.selectedJob);
  const tailorComplete = Boolean(
    input.selectedJob &&
    strengthenContentReady &&
    input.tailoredResumeJobId === input.selectedJob.id &&
    input.coverLetterJobId === input.selectedJob.id &&
    hasWorkflowText(input.coverLetterText, 120)
  );

  const hasAppliedTarget = Boolean(input.trackedTarget && input.trackedTarget.status !== "saved");
  const trackComplete = Boolean(
    input.trackedTarget &&
    (input.trackedTarget.status === "interview" || input.trackedTarget.status === "offer" || hasWorkflowText(input.trackedTarget.notes, 12))
  );

  const stages: WorkflowStage[] = [
    {
      id: "import",
      view: "resume",
      resumeStep: importComplete ? 1 : 0,
      label: "1. Import",
      shortLabel: "Import",
      description: "Upload your CV, parse it, and fill missing facts.",
      status: importComplete ? "complete" : draftProgress.hasAnyData ? "in_progress" : "ready",
      unlocked: true,
      complete: importComplete,
      blocker: importComplete ? undefined : draftProgress.hasCoreIdentity
        ? "Add at least one experience or education entry before moving on."
        : "Add name, email, and location so the resume has usable core identity.",
      evidence: importComplete
        ? `${savedExperienceCount} roles and ${savedEducationCount} education entries are available.`
        : draftProgress.hasAnyData
          ? "Resume import has started but the core identity is incomplete."
          : "No imported resume facts yet.",
    },
    {
      id: "improve",
      view: "resume",
      resumeStep: strengthenContentReady ? 5 : 4,
      label: "2. Strengthen",
      shortLabel: "Strengthen",
      description: "Improve resume quality, ATS baseline, and profile completeness.",
      status: !importComplete
        ? "locked"
        : strengthenContentReady && input.atsBaselineComplete
          ? "complete"
          : (savedSkillsCount > 0 || hasWorkflowText(input.savedResume?.summary)) ? "in_progress" : "ready",
      unlocked: importComplete,
      complete: strengthenContentReady && input.atsBaselineComplete,
      blocker: !importComplete
        ? "Finish Import first."
        : !hasWorkflowText(input.savedResume?.summary, 60)
          ? "Add a stronger summary before this stage can complete."
          : savedSkillsCount < 5
            ? "Add at least 5 explicit skills."
            : savedHighlightCount < 3
              ? "Add measurable experience bullets."
              : !input.atsBaselineComplete
                ? "Run ATS analysis at least once."
                : undefined,
      evidence: strengthenContentReady
        ? `${savedSkillsCount} skills and ${savedHighlightCount} strong bullets detected.`
        : "Resume quality is still being strengthened.",
    },
    {
      id: "match",
      view: "jobs",
      label: "3. Match",
      shortLabel: "Match",
      description: "Show best-fit jobs ranked against the current resume.",
      status: !strengthenContentReady || !input.atsBaselineComplete
        ? "locked"
        : hasSelectedJob
          ? "complete"
          : input.matchedJobsCount > 0 ? "in_progress" : "ready",
      unlocked: strengthenContentReady && input.atsBaselineComplete,
      complete: hasSelectedJob,
      blocker: !strengthenContentReady || !input.atsBaselineComplete
        ? "Finish Strengthen first."
        : input.matchedJobsCount === 0
          ? "Run job search and review ranked roles."
          : "Choose one target job before moving into Tailor.",
      evidence: input.matchedJobsCount > 0
        ? `${input.matchedJobsCount} ranked roles found${input.selectedJob ? ` and ${input.selectedJob.title} is selected.` : "."}`
        : "No ranked roles yet.",
    },
    {
      id: "tailor",
      view: "tailor",
      label: "4. Tailor",
      shortLabel: "Tailor",
      description: "Pick one job and tailor resume plus cover letter together.",
      status: !hasSelectedJob
        ? "locked"
        : tailorComplete
          ? "complete"
          : "in_progress",
      unlocked: hasSelectedJob,
      complete: tailorComplete,
      blocker: !hasSelectedJob
        ? "Finish Match by selecting a target job."
        : input.tailoredResumeJobId !== input.selectedJob?.id
          ? "Apply tailored resume changes for the selected job."
          : input.coverLetterJobId !== input.selectedJob?.id || !hasWorkflowText(input.coverLetterText, 120)
            ? "Generate or refine a cover letter for the selected job."
            : undefined,
      evidence: tailorComplete
        ? "Tailored resume and cover letter are ready for the current job."
        : "A target job is selected, but tailored assets are still incomplete.",
    },
    {
      id: "apply",
      view: hasSelectedJob ? "tailor" : "jobs",
      label: "5. Apply",
      shortLabel: "Apply",
      description: "Open the job, confirm the asset set, and log the application.",
      status: !tailorComplete
        ? "locked"
        : hasAppliedTarget
          ? "complete"
          : input.trackedTarget?.status === "saved" ? "in_progress" : "ready",
      unlocked: tailorComplete,
      complete: hasAppliedTarget,
      blocker: !tailorComplete
        ? "Finish Tailor first."
        : !input.trackedTarget
          ? "Open the apply link and log the application."
          : input.trackedTarget.status === "saved"
            ? "Move the target job from saved to applied."
            : undefined,
      evidence: input.trackedTarget
        ? `Current target job is ${input.trackedTarget.status}.`
        : "Application has not been logged yet.",
    },
    {
      id: "track",
      view: "tracker",
      label: "6. Track",
      shortLabel: "Track",
      description: "Move through interview, offer, rejection, and follow-up.",
      status: !hasAppliedTarget
        ? "locked"
        : trackComplete
          ? "complete"
          : "in_progress",
      unlocked: hasAppliedTarget,
      complete: trackComplete,
      blocker: !hasAppliedTarget
        ? "Log an application before tracking it."
        : "Add notes or move the application forward to complete this stage.",
      evidence: input.trackedTarget
        ? `Pipeline status is ${input.trackedTarget.status}${input.trackedTarget.notes ? " with notes captured." : "."}`
        : `${input.trackedJobsCount} jobs are tracked overall.`,
    },
  ];

  return {
    stages,
    nextRecommendedStage: stages.find((stage) => stage.status === "ready" || stage.status === "in_progress") || stages[stages.length - 1],
    importComplete,
    strengthenContentReady,
    tailorComplete,
    hasAppliedTarget,
    trackComplete,
    savedSkillsCount,
    savedExperienceCount,
    savedEducationCount,
    savedHighlightCount,
    draftProgress,
  };
}
