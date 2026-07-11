import {
  SiPython,
  SiOpenjdk,
  SiJavascript,
  SiTypescript,
  SiCplusplus,
  SiGo,
  SiRust,
} from "react-icons/si";
import {
  InterviewType,
  Difficulty,
  SeniorityLevel,
  ProgrammingLanguage,
} from "@/config/enums";
import {
  Feather,
  Flame,
  Zap,
  Globe,
  FileText,
  Network,
  MessageSquare,
  Code2,
  Sprout,
  User,
  TrendingUp,
  Medal,
  ShieldCheck,
  Crown,
} from "lucide-react";

export const interviewTypeOptions = [
  {
    value: InterviewType.CODING,
    label: "Coding",
    icon: Code2,
  },
  {
    value: InterviewType.BEHAVIORAL,
    label: "Behavioral",
    icon: MessageSquare,
  },
  {
    value: InterviewType.SYSTEM_DESIGN,
    label: "System Design",
    icon: Network,
  },
  {
    value: InterviewType.RESUME_BASED,
    label: "Resume Based",
    icon: FileText,
  },
  {
    value: InterviewType.DOMAIN_SPECIFIC,
    label: "Domain Specific",
    icon: Globe,
  },
];

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
