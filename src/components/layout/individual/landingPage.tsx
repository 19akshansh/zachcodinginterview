import { Byok } from "../landing/byok";
import { CtaFooter } from "../landing/ctaFooter";
import { Faq } from "../landing/faq";
import { Features } from "../landing/features";
import { Hero } from "../landing/hero";
import { HowItWorks } from "../landing/howItWorks";
import { Nav } from "../landing/nav";
import { Pricing } from "../landing/pricing";
import { Recruiters } from "../landing/recruiters";

const LandingPage = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Recruiters />
        <Byok />
        <Pricing />
        <Faq />
      </main>
      <CtaFooter />
    </div>
  );
};

export default LandingPage;
