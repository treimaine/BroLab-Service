'use client'

import { MarketingPageShell } from '@/platform/ui'

/**
 * Privacy Policy Page Client Component
 * 
 * Client-side rendering for the privacy policy page.
 * Separated from page.tsx to allow metadata export in Server Component.
 */

// ============ TOC Items ============

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-information', label: 'How We Use Information' },
  { id: 'information-sharing', label: 'Information Sharing' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'third-party-services', label: 'Third-Party Services' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'childrens-privacy', label: "Children's Privacy" },
  { id: 'international-transfers', label: 'International Transfers' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
]

// ============ Main Component ============

export default function PrivacyPageClient() {
  return (
    <MarketingPageShell
      heroWord="PRIVACY"
      seoTitle="Privacy Policy - BroLab Entertainment"
      subtitle="How we collect, use, and protect your information"
      variant="long-form"
      lastUpdated="January 10, 2026"
      tocItems={TOC_ITEMS}
    >
      {/* Introduction */}
      <section id="introduction">
        <h2>Introduction</h2>
        <p>
          BroLab Entertainment (&quot;BroLab,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
          use our platform at brolabentertainment.com and related services (collectively, the &quot;Service&quot;).
        </p>
        <p>
          By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with 
          the terms of this Privacy Policy, please do not access the Service.
        </p>
      </section>

      {/* Information We Collect */}
      <section id="information-we-collect">
        <h2>Information We Collect</h2>
        
        <h3>Information You Provide</h3>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li>
            <strong>Account Information:</strong> When you create an account, we collect your name, 
            email address, and role (Producer, Engineer, or Artist).
          </li>
          <li>
            <strong>Profile Information:</strong> Information you add to your profile, such as your 
            workspace name, bio, and profile picture.
          </li>
          <li>
            <strong>Payment Information:</strong> When you subscribe to a plan or make purchases, 
            payment information is processed by our payment providers (Clerk Billing and Stripe). 
            We do not store complete credit card numbers.
          </li>
          <li>
            <strong>Content:</strong> Audio files, track metadata, service listings, and other 
            content you upload to the Service.
          </li>
          <li>
            <strong>Communications:</strong> Information you provide when you contact us for support 
            or communicate with other users through the Service.
          </li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <p>When you use the Service, we automatically collect certain information, including:</p>
        <ul>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with the Service, 
            including pages visited, features used, and actions taken.
          </li>
          <li>
            <strong>Device Information:</strong> Information about your device, including device type, 
            operating system, browser type, and unique device identifiers.
          </li>
          <li>
            <strong>Log Data:</strong> Server logs that record your IP address, access times, 
            and referring URLs.
          </li>
          <li>
            <strong>Location Data:</strong> General location information derived from your IP address.
          </li>
        </ul>
      </section>

      {/* How We Use Information */}
      <section id="how-we-use-information">
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send transactional emails (purchase confirmations, subscription updates)</li>
          <li>Respond to your comments, questions, and support requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
          <li>Personalize and improve your experience</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      {/* Information Sharing */}
      <section id="information-sharing">
        <h2>Information Sharing</h2>
        <p>We may share your information in the following circumstances:</p>
        
        <h3>With Service Providers</h3>
        <p>
          We share information with third-party service providers who perform services on our behalf, 
          including payment processing (Stripe), authentication (Clerk), email delivery (Resend), 
          and data storage (Convex).
        </p>

        <h3>With Other Users</h3>
        <p>
          Information you include in your public profile, storefront, and listings is visible to 
          other users of the Service. Artists can see Provider storefronts, and Providers can see 
          information about Artists who make purchases.
        </p>

        <h3>For Legal Reasons</h3>
        <p>
          We may disclose information if we believe it is necessary to comply with applicable law, 
          regulation, legal process, or governmental request; protect the rights, property, or 
          safety of BroLab, our users, or others; or enforce our Terms of Service.
        </p>

        <h3>Business Transfers</h3>
        <p>
          If BroLab is involved in a merger, acquisition, or sale of assets, your information may 
          be transferred as part of that transaction.
        </p>
      </section>

      {/* Data Security */}
      <section id="data-security">
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your information 
          against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul>
          <li>Encryption of data in transit using TLS/SSL</li>
          <li>Secure authentication through Clerk</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls limiting who can access your data</li>
          <li>Secure payment processing through PCI-compliant providers</li>
        </ul>
        <p>
          However, no method of transmission over the Internet or electronic storage is 100% secure. 
          While we strive to protect your information, we cannot guarantee absolute security.
        </p>
      </section>

      {/* Your Rights */}
      <section id="your-rights">
        <h2>Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information:</p>
        
        <h3>Access and Portability</h3>
        <p>
          You can access and download your personal information through your account settings. 
          You may request a copy of your data in a portable format.
        </p>

        <h3>Correction</h3>
        <p>
          You can update your account information at any time through your profile settings. 
          If you need assistance correcting other information, please contact us.
        </p>

        <h3>Deletion</h3>
        <p>
          You can request deletion of your account and associated data. Note that we may retain 
          certain information as required by law or for legitimate business purposes (such as 
          transaction records for tax compliance).
        </p>

        <h3>Opt-Out</h3>
        <p>
          You can opt out of promotional communications by following the unsubscribe instructions 
          in those messages. Note that you cannot opt out of transactional communications related 
          to your account or purchases.
        </p>

        <h3>GDPR Rights (EEA Users)</h3>
        <p>
          If you are in the European Economic Area, you have additional rights under GDPR, including 
          the right to object to processing, restrict processing, and lodge a complaint with a 
          supervisory authority.
        </p>

        <h3>CCPA Rights (California Residents)</h3>
        <p>
          California residents have the right to know what personal information is collected, 
          request deletion, and opt out of the sale of personal information. We do not sell 
          personal information.
        </p>
      </section>

      {/* Cookies */}
      <section id="cookies">
        <h2>Cookies &amp; Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to collect and store information about 
          your interactions with the Service. These technologies help us:
        </p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Authenticate your sessions</li>
          <li>Analyze how the Service is used</li>
          <li>Improve performance and user experience</li>
        </ul>
        
        <h3>Types of Cookies We Use</h3>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for the Service to function properly, 
            including authentication and security cookies.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences, such as theme settings 
            and language preferences.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how users interact with the 
            Service to improve functionality.
          </li>
        </ul>
        
        <p>
          You can control cookies through your browser settings. Note that disabling certain 
          cookies may affect the functionality of the Service.
        </p>
      </section>

      {/* Third-Party Services */}
      <section id="third-party-services">
        <h2>Third-Party Services</h2>
        <p>
          The Service integrates with third-party services that have their own privacy policies. 
          We encourage you to review their policies:
        </p>
        <ul>
          <li>
            <strong>Clerk</strong> (Authentication &amp; Billing):{' '}
            <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">clerk.com/privacy</a>
          </li>
          <li>
            <strong>Stripe</strong> (Payment Processing):{' '}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>
          </li>
          <li>
            <strong>Convex</strong> (Data Storage):{' '}
            <a href="https://www.convex.dev/privacy" target="_blank" rel="noopener noreferrer">convex.dev/privacy</a>
          </li>
          <li>
            <strong>Resend</strong> (Email Delivery):{' '}
            <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer">resend.com/privacy</a>
          </li>
        </ul>
      </section>

      {/* Data Retention */}
      <section id="data-retention">
        <h2>Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide 
          you with the Service. We may also retain and use your information as necessary to:
        </p>
        <ul>
          <li>Comply with legal obligations (e.g., tax records, transaction history)</li>
          <li>Resolve disputes and enforce agreements</li>
          <li>Maintain security and prevent fraud</li>
          <li>Support business operations</li>
        </ul>
        <p>
          When you delete your account, we will delete or anonymize your personal information 
          within 30 days, except for information we are required to retain by law.
        </p>
      </section>

      {/* Children's Privacy */}
      <section id="childrens-privacy">
        <h2>Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for children under 13 years of age (or 16 in the EEA). 
          We do not knowingly collect personal information from children. If you are a parent 
          or guardian and believe your child has provided us with personal information, please 
          contact us so we can delete it.
        </p>
      </section>

      {/* International Transfers */}
      <section id="international-transfers">
        <h2>International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your 
          country of residence. These countries may have different data protection laws. 
          When we transfer your information internationally, we take steps to ensure it 
          receives adequate protection, including:
        </p>
        <ul>
          <li>Using service providers that comply with applicable data protection frameworks</li>
          <li>Implementing appropriate contractual safeguards</li>
          <li>Relying on adequacy decisions where applicable</li>
        </ul>
      </section>

      {/* Changes */}
      <section id="changes">
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
          For significant changes, we may also send you an email notification.
        </p>
        <p>
          We encourage you to review this Privacy Policy periodically to stay informed about 
          how we are protecting your information.
        </p>
      </section>

      {/* Contact */}
      <section id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, 
          please contact us at:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:privacy@brolabentertainment.com">privacy@brolabentertainment.com</a>
        </p>
        <p>
          <strong>Subject Line:</strong> Privacy Inquiry
        </p>
        <p>
          We will respond to your inquiry within 30 days.
        </p>
      </section>
    </MarketingPageShell>
  )
}
