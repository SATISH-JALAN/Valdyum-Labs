import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import HeroSection from '@/components/sections/HeroSection';
import TrustStrip from '@/components/sections/TrustStrip';
import ProtocolSection from '@/components/sections/ProtocolSection';
import TreasurySection from '@/components/sections/TreasurySection';
import AgentGrid from '@/components/sections/AgentGrid';
import LiveForge from '@/components/sections/LiveForge';
import FAQSection from '@/components/sections/FAQSection';
import CTABand from '@/components/sections/CTABand';
import Footer from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#FAFBFC] overflow-x-hidden">
        <HeroSection />
        <TrustStrip />
        <ProtocolSection />
        <TreasurySection />
        <AgentGrid />
        <LiveForge />
        <FAQSection />
        <CTABand />
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
