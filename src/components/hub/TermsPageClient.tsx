'use client'

import { MarketingPageShell } from '@/platform/ui'

/**
 * Terms of Service Page Client Component
 * 
 * Client-side rendering for the terms page.
 * Separated from page.tsx to allow metadata export in Server Component.
 */

// ============ TOC Items ============

const TOC_ITEMS = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'account-registration', label: 'Account Registration' },
  { id: 'provider-terms', label: 'Provider Terms' },
  { id: 'artist-terms', label: 'Artist Terms' },
  { id: 'content-ownership', label: 'Content & Ownership' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'payments', label: 'Payments & Fees' },
  { id: 'prohibited-conduct', label: 'Prohibited Conduct' },
  { id: 'termination', label: 'Termination' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'limitation-liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'disputes', label: 'Dispute Resolution' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Us' },
]

// ============ Main Component ============

export default function TermsPageClient() {
  return (
    <MarketingPageShell
      heroWord="TERMS"
      seoTitle="Terms of Service - BroLab Entertainment"
      subtitle="The rules and guidelines for using our platform"
      variant="long-form"
      lastUpdated="January 10, 2026"
      tocItems={TOC_ITEMS}
    >
      {/* Acceptance of Terms */}
      <section id="acceptance">
        <h2>Acceptance of Terms</h2>
        <p>
          Welcome to BroLab Entertainment (&quot;BroLab,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service 
          (&quot;Terms&quot;) govern your access to and use of our platform at brolabentertainment.com and 
          related services (collectively, the &quot;Service&quot;).
        </p>
        <p>
          By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. 
          If you do not agree to these Terms, you may not access or use the Service.
        </p>
        <p>
          We may modify these Terms at any time. Your continued use of the Service after any changes 
          constitutes acceptance of the modified Terms.
        </p>
      </section>

      {/* Eligibility */}
      <section id="eligibility">
        <h2>Eligibility</h2>
        <p>To use the Service, you must:</p>
        <ul>
          <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
          <li>Have the legal capacity to enter into a binding agreement</li>
          <li>Not be prohibited from using the Service under applicable laws</li>
          <li>Provide accurate and complete registration information</li>
        </ul>
        <p>
          If you are using the Service on behalf of an organization, you represent that you have 
          the authority to bind that organization to these Terms.
        </p>
      </section>

      {/* Account Registration */}
      <section id="account-registration">
        <h2>Account Registration</h2>
        <p>
          To access certain features of the Service, you must create an account. When you create 
          an account, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and promptly update your account information</li>
          <li>Keep your login credentials secure and confidential</li>
          <li>Notify us immediately of any unauthorized access to your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms or 
          contain inaccurate information.
        </p>
      </section>

      {/* Provider Terms */}
      <section id="provider-terms">
        <h2>Provider Terms</h2>
        <p>
          If you register as a Provider (Producer or Audio Engineer), the following additional 
          terms apply:
        </p>
        
        <h3>Subscription Plans</h3>
        <p>
          Providers must subscribe to a paid plan (BASIC or PRO) to access storefront features. 
          Subscription fees are billed through Clerk Billing and are non-refundable except as 
          required by law.
        </p>
        
        <h3>Storefront Responsibilities</h3>
        <p>As a Provider, you are responsible for:</p>
        <ul>
          <li>All content you upload to your storefront</li>
          <li>Ensuring you have the rights to sell the beats and services you list</li>
          <li>Accurately describing your products and services</li>
          <li>Fulfilling orders and providing services as described</li>
          <li>Responding to customer inquiries in a timely manner</li>
        </ul>
        
        <h3>Payment Processing</h3>
        <p>
          To receive payments from Artists, you must connect a Stripe account. Payments from 
          Artists are processed directly to your connected Stripe account. You are responsible 
          for any fees charged by Stripe and for complying with Stripe&apos;s terms of service.
        </p>
      </section>

      {/* Artist Terms */}
      <section id="artist-terms">
        <h2>Artist Terms</h2>
        <p>
          If you register as an Artist, the following additional terms apply:
        </p>
        
        <h3>Purchases</h3>
        <p>
          When you purchase beats or services from Providers, you are entering into a transaction 
          directly with that Provider. BroLab facilitates these transactions but is not a party 
          to them.
        </p>
        
        <h3>License Terms</h3>
        <p>
          When you purchase a beat, you receive a license according to the tier you selected 
          (Basic, Premium, or Unlimited). The specific rights granted are detailed in the 
          license agreement provided with your purchase. You must comply with all license terms.
        </p>
        
        <h3>Downloads</h3>
        <p>
          After purchase, you can download your licensed content from your Artist Dashboard. 
          You are responsible for maintaining your own backups of downloaded content.
        </p>
      </section>

      {/* Content & Ownership */}
      <section id="content-ownership">
        <h2>Content &amp; Ownership</h2>
        
        <h3>Your Content</h3>
        <p>
          You retain ownership of all content you upload to the Service (&quot;Your Content&quot;). 
          By uploading content, you grant BroLab a non-exclusive, worldwide, royalty-free license 
          to host, store, display, and distribute Your Content solely for the purpose of operating 
          and providing the Service.
        </p>
        
        <h3>Content Representations</h3>
        <p>By uploading content, you represent and warrant that:</p>
        <ul>
          <li>You own or have the necessary rights to the content</li>
          <li>The content does not infringe any third-party rights</li>
          <li>The content complies with all applicable laws</li>
          <li>The content does not contain malware or harmful code</li>
        </ul>
        
        <h3>BroLab Content</h3>
        <p>
          The Service and its original content (excluding Your Content), features, and functionality 
          are owned by BroLab and are protected by copyright, trademark, and other intellectual 
          property laws.
        </p>
      </section>

      {/* Licensing */}
      <section id="licensing">
        <h2>Licensing</h2>
        <p>
          BroLab offers three standard license tiers for beat purchases:
        </p>
        
        <h3>Basic License</h3>
        <ul>
          <li>Commercial use permitted</li>
          <li>Up to 100,000 audio streams</li>
          <li>1 music video</li>
          <li>Up to 10 live performances</li>
          <li>No radio broadcast rights</li>
          <li>No sync licensing</li>
          <li>Stems not included</li>
        </ul>
        
        <h3>Premium License</h3>
        <ul>
          <li>Commercial use permitted</li>
          <li>Up to 500,000 audio streams</li>
          <li>2 music videos</li>
          <li>Up to 25 live performances</li>
          <li>Up to 10 radio broadcasts</li>
          <li>No sync licensing</li>
          <li>Stems not included</li>
        </ul>
        
        <h3>Unlimited License</h3>
        <ul>
          <li>Commercial use permitted</li>
          <li>Unlimited audio streams</li>
          <li>Unlimited music videos</li>
          <li>Unlimited live performances</li>
          <li>Unlimited radio broadcasts</li>
          <li>Sync licensing permitted</li>
          <li>Stems included</li>
        </ul>
        
        <p>
          All licenses include a 50/50 publishing split between the licensor (Producer) and 
          licensee (Artist) for both writer and publisher shares.
        </p>
      </section>

      {/* Payments & Fees */}
      <section id="payments">
        <h2>Payments &amp; Fees</h2>
        
        <h3>Provider Subscriptions</h3>
        <p>
          Provider subscription fees are charged through Clerk Billing. Subscriptions automatically 
          renew unless cancelled before the renewal date. You can manage your subscription in 
          your Studio Dashboard.
        </p>
        
        <h3>Artist Purchases</h3>
        <p>
          All prices are displayed in USD. Payments are processed through Stripe directly to 
          the Provider&apos;s connected account. BroLab does not charge platform fees on artist 
          purchases at this time.
        </p>
        
        <h3>Refunds</h3>
        <p>
          Due to the digital nature of the products, all sales are final. Refunds may be issued 
          at the sole discretion of the Provider or in cases of technical issues that prevent 
          delivery of purchased content.
        </p>
        
        <h3>Taxes</h3>
        <p>
          You are responsible for any applicable taxes on your purchases or earnings. Providers 
          are responsible for reporting and paying taxes on their income from the Service.
        </p>
      </section>

      {/* Prohibited Conduct */}
      <section id="prohibited-conduct">
        <h2>Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Upload content that is illegal, harmful, threatening, abusive, or defamatory</li>
          <li>Impersonate any person or entity</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Use the Service for any fraudulent or deceptive purpose</li>
          <li>Scrape, crawl, or use automated means to access the Service without permission</li>
          <li>Circumvent any security measures or access controls</li>
          <li>Resell or redistribute content without proper licensing</li>
          <li>Use the Service to distribute malware or harmful code</li>
          <li>Engage in any activity that could damage or impair the Service</li>
        </ul>
      </section>

      {/* Termination */}
      <section id="termination">
        <h2>Termination</h2>
        
        <h3>Termination by You</h3>
        <p>
          You may terminate your account at any time by contacting us or through your account 
          settings. Upon termination, your right to use the Service will immediately cease.
        </p>
        
        <h3>Termination by BroLab</h3>
        <p>
          We may suspend or terminate your account at any time, with or without cause, and with 
          or without notice. Reasons for termination may include:
        </p>
        <ul>
          <li>Violation of these Terms</li>
          <li>Fraudulent or illegal activity</li>
          <li>Non-payment of fees</li>
          <li>Extended periods of inactivity</li>
          <li>Requests by law enforcement</li>
        </ul>
        
        <h3>Effect of Termination</h3>
        <p>
          Upon termination, your access to the Service will be disabled. Providers&apos; storefronts 
          will be taken offline. Artists will retain access to previously purchased content 
          through their license agreements, which survive termination.
        </p>
      </section>

      {/* Disclaimers */}
      <section id="disclaimers">
        <h2>Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will be uninterrupted, secure, or error-free</li>
          <li>The results obtained from the Service will be accurate or reliable</li>
          <li>Any errors in the Service will be corrected</li>
          <li>The Service will meet your specific requirements</li>
        </ul>
        <p>
          BroLab is a platform that connects Providers and Artists. We do not guarantee the 
          quality, safety, or legality of content listed on the Service, the truth or accuracy 
          of listings, or the ability of Providers to sell or Artists to pay.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section id="limitation-liability">
        <h2>Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BROLAB SHALL NOT BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR 
          REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
          OR OTHER INTANGIBLE LOSSES.
        </p>
        <p>
          IN NO EVENT SHALL BROLAB&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR 
          RELATING TO THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO BROLAB 
          IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
        </p>
        <p>
          SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR 
          CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.
        </p>
      </section>

      {/* Indemnification */}
      <section id="indemnification">
        <h2>Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless BroLab and its officers, directors, 
          employees, agents, and affiliates from and against any and all claims, damages, 
          obligations, losses, liabilities, costs, and expenses (including attorney&apos;s fees) 
          arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights, including intellectual property rights</li>
          <li>Any content you upload or submit to the Service</li>
          <li>Any transaction between you and another user</li>
        </ul>
      </section>

      {/* Dispute Resolution */}
      <section id="disputes">
        <h2>Dispute Resolution</h2>
        
        <h3>Informal Resolution</h3>
        <p>
          Before filing a formal dispute, you agree to try to resolve any dispute informally 
          by contacting us at legal@brolabentertainment.com. We will attempt to resolve the 
          dispute within 30 days.
        </p>
        
        <h3>Arbitration</h3>
        <p>
          If we cannot resolve a dispute informally, you and BroLab agree to resolve any 
          disputes through binding arbitration, rather than in court, except that either 
          party may bring claims in small claims court if they qualify.
        </p>
        
        <h3>Class Action Waiver</h3>
        <p>
          YOU AND BROLAB AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR 
          OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED 
          CLASS OR REPRESENTATIVE PROCEEDING.
        </p>
        
        <h3>Governing Law</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the 
          State of Delaware, United States, without regard to its conflict of law provisions.
        </p>
      </section>

      {/* Changes to Terms */}
      <section id="changes">
        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of any 
          changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
        </p>
        <p>
          For material changes, we may also send you an email notification. Your continued 
          use of the Service after any changes constitutes acceptance of the modified Terms.
        </p>
        <p>
          If you do not agree to the modified Terms, you must stop using the Service and 
          may terminate your account.
        </p>
      </section>

      {/* Contact */}
      <section id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:legal@brolabentertainment.com">legal@brolabentertainment.com</a>
        </p>
        <p>
          <strong>Subject Line:</strong> Terms of Service Inquiry
        </p>
        <p>
          We will respond to your inquiry within 30 days.
        </p>
      </section>
    </MarketingPageShell>
  )
}
