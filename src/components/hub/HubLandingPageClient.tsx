import { CommissionCalculator } from '@/components/hub/CommissionCalculator'
import { FAQSection } from '@/components/hub/FAQSection'
import { HeroSection } from '@/components/hub/HeroSection'
import { StorefrontDemoSection } from '@/components/hub/StorefrontDemoSection'
import {
  CTASection,
  FeaturesSection,
  FinalCTASection,
  HowItWorksSection,
  MobileInfoSection,
  ObjectionsSection,
  PricingSection,
  TrustRow
} from '@/components/hub/LandingSections'

/**
 * Landing page composition.
 *
 * Sections alternate between --bg and --bg-2 so the page reads as distinct
 * bands rather than one continuous flat surface. Keep that alternation intact
 * when inserting a section.
 */
export default function HubLandingPageClient() {
  return (
    <main>
      <HeroSection />
      <TrustRow />
      <MobileInfoSection />
      <CTASection />
      <CommissionCalculator />
      <FeaturesSection />
      <HowItWorksSection />
      <StorefrontDemoSection />
      <PricingSection />
      <ObjectionsSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
