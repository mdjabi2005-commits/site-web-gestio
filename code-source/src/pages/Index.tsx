import { useState } from "react";
import FooterSection from "@/components/FooterSection";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MobileSection from "@/components/MobileSection";
import ServicesSection from "@/components/ServicesSection";
import PrivacySection from "@/components/PrivacySection";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import DownloadSection from "@/components/DownloadSection";
import GuidesSection from "@/components/GuidesSection";
import FAQSection from "@/components/FAQSection";
import { MainNavigation, type TabId } from "@/components/MainNavigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <HeroSection />
            <FeaturesSection />
            <PrivacySection />
            <ScreenshotsSection />
          </>
        );
      case "mobile":
        return <MobileSection />;
      case "services":
        return <ServicesSection />;
      case "download":
        return <DownloadSection />;
      case "faq":
        return (
          <>
            <GuidesSection />
            <FAQSection />
          </>
        );
      default:
        return <HeroSection />;
    }
  };

  return (
    <>
      <MainNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-[72px]">
        {renderContent()}
      </main>
      <FooterSection />
    </>
  );
};

export default Index;
