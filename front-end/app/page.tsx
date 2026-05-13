import Navbar from "@/components/navbar";
import HeroSection from "@/components/LandingPage/section/hero";
import FeatureGridSection from "@/components/LandingPage/section/features";
import HowItWorksSection from "@/components/LandingPage/section/howitworks";
import TestimonialsSection from "@/components/LandingPage/section/testimonials";
import FaqSection from "@/components/LandingPage/section/faqSection";
import Footer from "@/components/footer";
import CallToActionSection from "@/components/LandingPage/section/calltoaction";
import { CosmicBackground } from "@/components/LandingPage/CosmicBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#030303] dark:text-white">
      <CosmicBackground />
      
      <div className="relative z-10">
        <Navbar />
        <main className="flex flex-col">
          <HeroSection />
          <FeatureGridSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <FaqSection />
          <CallToActionSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
