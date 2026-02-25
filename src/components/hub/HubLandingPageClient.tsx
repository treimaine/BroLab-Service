import { FAQSection } from '@/components/hub/FAQSection'
import { HeroSection } from '@/components/hub/HeroSection'
import {
    CTASection,
    ComparisonSection,
    FeaturesSection,
    FinalCTASection,
    HowItWorksSection,
    MobileInfoSection,
    PricingSection,
    ProductPreviewSection,
    StatsSection,
    TrustRow
} from '@/components/hub/LandingSections'

export default function HubLandingPageClient() {
  return (
    <main>
      <HeroSection />
      <TrustRow />
      <MobileInfoSection />
      <CTASection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <PricingSection />
      <ComparisonSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
