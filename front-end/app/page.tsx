import Navbar from "@/components/navbar";
import HeroSection from "@/components/LandingPage/section/hero";
import FeatureGridSection from "@/components/LandingPage/section/features";
// import HowItWorksSection from "@/components/LandingPage/section/howitworks";
import FaqSection from "@/components/LandingPage/section/faqSection";
import Footer from "@/components/footer";
import CallToActionSection from "@/components/LandingPage/section/calltoaction";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 bg-[#0c0f1a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_12%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0e17]" />
      <div className="relative">
        <Navbar />
        <main className="flex flex-col gap-12 pb-16 pt-16">
          <HeroSection />

          <FeatureGridSection />
          {/* <HowItWorksSection /> */}
          <FaqSection />
          <CallToActionSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
