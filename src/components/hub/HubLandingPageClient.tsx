import { CreatorStatsCounter } from '@/components/hub'
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
  TestimonialSection,
  TrustRow
} from '@/components/hub/LandingSections'

export default function HubLandingPageClient() {
  return (
    <main>
      <HeroSection />
      <TrustRow />
      <MobileInfoSection />
      <CTASection />
      <CreatorStatsCounter />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <PricingSection />
      <ComparisonSection />
      <TestimonialSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
