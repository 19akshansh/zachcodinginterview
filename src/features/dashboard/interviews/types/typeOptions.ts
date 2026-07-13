import {
  Building2,
  Code2,
  Crown,
  Feather,
  FileText,
  Flame,
  Globe,
  Medal,
  MessageSquare,
  Network,
  Rocket,
  ShieldCheck,
  Sprout,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import {
  SiCplusplus,
  SiGo,
  SiJavascript,
  SiOpenjdk,
  SiPython,
  SiRust,
  SiTypescript,
} from "react-icons/si";
import {
  CompanyTier,
  Difficulty,
  INTERVIEW_TYPE_LABELS,
  InterviewType,
  ProgrammingLanguage,
  SeniorityLevel,
} from "@/config/enums";

export const interviewTypeOptions = [
  {
    value: InterviewType.CODING,
    label: INTERVIEW_TYPE_LABELS[InterviewType.CODING],
    icon: Code2,
  },
  {
    value: InterviewType.BEHAVIORAL,
    label: INTERVIEW_TYPE_LABELS[InterviewType.BEHAVIORAL],
    icon: MessageSquare,
  },
  {
    value: InterviewType.SYSTEM_DESIGN,
    label: INTERVIEW_TYPE_LABELS[InterviewType.SYSTEM_DESIGN],
    icon: Network,
  },
  {
    value: InterviewType.RESUME_BASED,
    label: INTERVIEW_TYPE_LABELS[InterviewType.RESUME_BASED],
    icon: FileText,
  },
  {
    value: InterviewType.DOMAIN_SPECIFIC,
    label: INTERVIEW_TYPE_LABELS[InterviewType.DOMAIN_SPECIFIC],
    icon: Globe,
  },
];

export const interviewTypeMeta: Record<
  string,
  { label: string; icon: (typeof interviewTypeOptions)[number]["icon"] }
> = Object.fromEntries(
  interviewTypeOptions.map((opt) => [
    opt.value,
    { label: opt.label, icon: opt.icon },
  ]),
);

export const difficultyOptions = [
  { value: Difficulty.EASY, label: "Easy", icon: Feather },
  { value: Difficulty.MEDIUM, label: "Medium", icon: Flame },
  { value: Difficulty.HARD, label: "Hard", icon: Zap },
];

export const seniorityOptions = [
  {
    value: SeniorityLevel.ENTRY,
    label: "Entry",
    icon: Sprout,
  },
  {
    value: SeniorityLevel.JUNIOR,
    label: "Junior",
    icon: User,
  },
  {
    value: SeniorityLevel.INTERMEDIATE,
    label: "Intermediate",
    icon: TrendingUp,
  },
  {
    value: SeniorityLevel.SENIOR,
    label: "Senior",
    icon: Medal,
  },
  {
    value: SeniorityLevel.STAFF,
    label: "Staff",
    icon: ShieldCheck,
  },
  {
    value: SeniorityLevel.PRINCIPAL,
    label: "Principal",
    icon: Crown,
  },
];

export const companyTierOptions = [
  {
    value: CompanyTier.STARTUP,
    label: "Startup",
    icon: Rocket,
  },
  {
    value: CompanyTier.MID_MARKET,
    label: "Mid-Market",
    icon: Building2,
  },
  {
    value: CompanyTier.FAANG,
    label: "FAANG",
    icon: Crown,
  },
];

export const languageOptions = [
  {
    value: ProgrammingLanguage.PYTHON,
    label: "Python",
    icon: SiPython,
    color: "#3776AB",
    disabled: false,
  },
  {
    value: ProgrammingLanguage.TYPESCRIPT,
    label: "TypeScript",
    icon: SiTypescript,
    color: "#3178C6",
    disabled: true,
  },
  {
    value: ProgrammingLanguage.JAVASCRIPT,
    label: "JavaScript",
    icon: SiJavascript,
    color: "#F7DF1E",
    disabled: false,
  },
  {
    value: ProgrammingLanguage.JAVA,
    label: "Java",
    icon: SiOpenjdk,
    color: "#007396",
    disabled: true,
  },
  {
    value: ProgrammingLanguage.CPP,
    label: "C++",
    icon: SiCplusplus,
    color: "#00599C",
    disabled: true,
  },
  {
    value: ProgrammingLanguage.GO,
    label: "Go",
    icon: SiGo,
    color: "#00ADD8",
    disabled: true,
  },
  {
    value: ProgrammingLanguage.RUST,
    label: "Rust",
    icon: SiRust,
    color: "#000000",
    disabled: true,
  },
];
