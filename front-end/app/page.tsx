import Navbar from "@/components/navbar";
import HeroSection from "@/components/LandingPage/section/hero";
import FeatureGridSection from "@/components/LandingPage/section/features";
import HowItWorksSection from "@/components/LandingPage/section/howItWorks";
import TestimonialsSection from "@/components/LandingPage/section/testimonials";
import FaqSection from "@/components/LandingPage/section/faqSection";
import Footer from "@/components/footer";
import CallToActionSection from "@/components/LandingPage/section/calltoaction";
import { CosmicBackground } from "@/components/LandingPage/CosmicBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white bg-[#030303] overflow-x-hidden">
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
