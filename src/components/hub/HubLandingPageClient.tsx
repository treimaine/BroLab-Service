import { FAQSection } from '@/components/hub/FAQSection'
import { HeroSection } from '@/components/hub/HeroSection'
import {
    CTASection,
    FeaturesSection,
    FinalCTASection,
    HowItWorksSection,
    MobileInfoSection,
    ProductPreviewSection,
    TrustRow
} from '@/components/hub/LandingSections'

export default function HubLandingPageClient() {
  return (
    <main>
      <HeroSection />
      <TrustRow />
      <MobileInfoSection />
      <CTASection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
