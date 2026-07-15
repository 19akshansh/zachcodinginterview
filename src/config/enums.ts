export enum UserRole {
  CANDIDATE = "CANDIDATE",
  RECRUITER = "RECRUITER",
  ADMIN = "ADMIN",
}

export enum ProfileVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum InterviewType {
  CODING = "CODING",
  BEHAVIORAL = "BEHAVIORAL",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
  RESUME_BASED = "RESUME_BASED",
  DOMAIN_SPECIFIC = "DOMAIN_SPECIFIC",
}

export enum InterviewStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum SeniorityLevel {
  ENTRY = "ENTRY",
  JUNIOR = "JUNIOR",
  INTERMEDIATE = "INTERMEDIATE",
  SENIOR = "SENIOR",
  STAFF = "STAFF",
  PRINCIPAL = "PRINCIPAL",
}

export enum CompanyTier {
  STARTUP = "STARTUP",
  MID_MARKET = "MID_MARKET",
  FAANG = "FAANG",
}

export enum ProgrammingLanguage {
  PYTHON = "PYTHON",
  JAVA = "JAVA",
  JAVASCRIPT = "JAVASCRIPT",
  TYPESCRIPT = "TYPESCRIPT",
  CPP = "CPP",
  GO = "GO",
  RUST = "RUST",
}

export enum TestCaseVisibility {
  PUBLIC = "PUBLIC",
  HIDDEN = "HIDDEN",
  CUSTOM = "CUSTOM",
}

export enum SubmissionResult {
  PASSED = "PASSED",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
  ERROR = "ERROR",
  TIMEOUT = "TIMEOUT",
}

export enum Verdict {
  STRONG_HIRE = "STRONG_HIRE",
  HIRE = "HIRE",
  LEAN_HIRE = "LEAN_HIRE",
  NO_HIRE = "NO_HIRE",
  STRONG_NO_HIRE = "STRONG_NO_HIRE",
}

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  COMPLETED = "COMPLETED",
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  [InterviewType.CODING]: "Coding",
  [InterviewType.BEHAVIORAL]: "Behavioral",
  [InterviewType.SYSTEM_DESIGN]: "System Design",
  [InterviewType.RESUME_BASED]: "Resume Based",
  [InterviewType.DOMAIN_SPECIFIC]: "Domain Specific",
};

export const PROGRAMMING_LANGUAGE_LABELS: Record<ProgrammingLanguage, string> =
  {
    [ProgrammingLanguage.PYTHON]: "Python",
    [ProgrammingLanguage.JAVA]: "Java",
    [ProgrammingLanguage.JAVASCRIPT]: "JavaScript",
    [ProgrammingLanguage.TYPESCRIPT]: "TypeScript",
    [ProgrammingLanguage.CPP]: "C++",
    [ProgrammingLanguage.GO]: "Go",
    [ProgrammingLanguage.RUST]: "Rust",
  };

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  [SeniorityLevel.ENTRY]: "Entry Level",
  [SeniorityLevel.JUNIOR]: "Junior",
  [SeniorityLevel.INTERMEDIATE]: "Intermediate",
  [SeniorityLevel.SENIOR]: "Senior",
  [SeniorityLevel.STAFF]: "Staff",
  [SeniorityLevel.PRINCIPAL]: "Principal",
};

export const COMPANY_TIER_LABELS: Record<CompanyTier, string> = {
  [CompanyTier.STARTUP]: "Startup",
  [CompanyTier.MID_MARKET]: "Mid-Market",
  [CompanyTier.FAANG]: "FAANG",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  [Verdict.STRONG_HIRE]: "Strong Hire",
  [Verdict.HIRE]: "Hire",
  [Verdict.LEAN_HIRE]: "Lean Hire",
  [Verdict.NO_HIRE]: "No Hire",
  [Verdict.STRONG_NO_HIRE]: "Strong No Hire",
};

export const PRACTICE_TYPES = [
  InterviewType.CODING,
  InterviewType.SYSTEM_DESIGN,
  InterviewType.BEHAVIORAL,
] as const;

export type PracticeType = (typeof PRACTICE_TYPES)[number];
