import Footer from "@/components/footer";
import CallToActionSection from "@/components/LandingPage/section/calltoaction";
import FeaturesSection from "@/components/LandingPage/section/features";
import HeroSection from "@/components/LandingPage/section/hero";
import HowItWorksSection from "@/components/LandingPage/section/howitworks";
import Navbar from "@/components/navbar";
import AboutSection from "@/components/LandingPage/section/aboutSection";
import FaqSection from "@/components/LandingPage/section/faqSection";

;

export default function Home() {
  return (
    <>
    <Navbar/>
  
    <div className=" container mx-auto flex flex-col  gap-4 py-4 md:py-5">
        <HeroSection/> 
        <FeaturesSection/>
         <HowItWorksSection/>
         <FaqSection/>
        <CallToActionSection/>
    </div>
    <Footer/>
    </>
  );
}
