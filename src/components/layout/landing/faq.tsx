import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./reveal";

const FAQS = [
  {
    question: "What happens when I run out of free interviews?",
    answer:
      "The free plan includes 2 interviews and 2 practice attempts total. Once you've used them, you can upgrade to Pro for unlimited interviews and practice, longer time limits, more questions per interview, and the full practice question library.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "Coding questions run against real test cases in Python, Java, JavaScript, TypeScript, C++, Go, and Rust.",
  },
  {
    question: "Is my Gemini API key stored anywhere?",
    answer:
      "No. If you add your own key in Settings, it's kept in your browser and sent along with each request - it's never saved on our servers.",
  },
  {
    question: "Can recruiters see my practice activity?",
    answer:
      "Only if you're a recruiter account and you've turned on visibility to other recruiters yourself - candidates control this from Settings, and it's off by default.",
  },
  {
    question: "Do I need a credit card to sign up?",
    answer:
      "No. You can create an account and start your first free interview or practice attempt right away.",
  },
];

export const Faq = () => {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <span className="font-mono text-xs tracking-wide text-primary uppercase">
          FAQ
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Questions, answered
        </h2>
      </Reveal>

      <Reveal delayMs={100} className="mt-10">
        <Accordion multiple={false}>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
};
