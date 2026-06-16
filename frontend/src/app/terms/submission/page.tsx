import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Submission Terms of Service — WaitingTheLongest.com",
  description: "Terms governing dog profile submissions to WaitingTheLongest.com",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl font-bold text-wtl-navy mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="text-sm text-wtl-navy/80 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function SubmissionTermsPage() {
  return (
    <div className="bg-wtl-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 text-sm text-wtl-muted hover:text-wtl-coral transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to submission form
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Shield className="w-8 h-8 text-wtl-coral flex-shrink-0 mt-1" />
          <div>
            <h1 className="font-display text-3xl font-bold text-wtl-navy mb-2">
              Submission Terms of Service
            </h1>
            <p className="text-sm text-wtl-muted">
              Effective Date: June 2026 &nbsp;·&nbsp; Last Updated: June 2026
            </p>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <p className="text-sm text-wtl-navy/80 leading-relaxed">
            These Submission Terms (&ldquo;Terms&rdquo;) govern your use of the WaitingTheLongest.com dog
            submission service (&ldquo;Service&rdquo;). By submitting a dog profile through our intake portal,
            you (&ldquo;Submitter&rdquo;) agree to these Terms in full.
          </p>
          <p className="text-sm font-bold text-wtl-coral mt-3">
            If you do not agree to these Terms, do not submit.
          </p>
        </div>

        <Section title="1. Who May Submit">
          <p>The Service is open to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Individuals</strong> who have lawful custody, foster responsibility, or caretaking authority over the dog being listed</li>
            <li><strong>Rescue organizations and foster networks</strong> operating lawfully within their jurisdiction</li>
            <li><strong>Animal shelters and animal control organizations</strong> that have lawful custody of the dog</li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
            <p className="font-semibold text-red-800 mb-1">Strictly Prohibited</p>
            <ul className="list-disc pl-5 space-y-1 text-red-700">
              <li>Commercial breeders (hobby, licensed, or unlicensed)</li>
              <li>Pet stores, pet brokers, or any entity engaged in for-profit animal sales</li>
              <li>Any person selling, auctioning, or trading animals for monetary gain</li>
              <li>Any person misrepresenting their identity or organizational affiliation</li>
            </ul>
            <p className="text-red-700 mt-2 text-xs">
              Prohibited submitters will be removed, permanently banned, and their information
              may be shared with the ASPCA, Humane Society, or local law enforcement.
            </p>
          </div>
        </Section>

        <Section title="2. Content License">
          <p>
            By submitting content (photographs, descriptions, dog information, or any other
            materials) through the Service, you grant WaitingTheLongest.com and its operators an{" "}
            <strong>
              unlimited, perpetual, irrevocable, worldwide, royalty-free, sublicensable,
              transferable license
            </strong>{" "}
            to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display, reproduce, modify, adapt, publish, translate, and distribute all submitted content</li>
            <li>Use submitted content for marketing, advertising, fundraising, social media, press, and any promotional purpose</li>
            <li>Create derivative works (graphic overlays, social media cards, video content, print materials)</li>
            <li>Sublicense content rights to partners and media outlets to further dog adoptions</li>
            <li>Use submitted content in perpetuity, even after a dog is adopted or a submission is removed</li>
          </ul>
          <p>
            <strong>You retain ownership</strong> of your original content. This license does not
            transfer copyright — it grants us broad rights to use it.
          </p>
        </Section>

        <Section title="3. Accuracy Warranty">
          <p>By submitting, you warrant and represent that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All information is <strong>true, accurate, and complete</strong> to the best of your knowledge</li>
            <li>The intake date accurately reflects when the dog entered care</li>
            <li>You have not misrepresented the dog&apos;s health, temperament, or history</li>
            <li>You have not fabricated or manipulated any submitted photographs</li>
            <li>The dog is currently available for adoption</li>
            <li>Your name, organization, and contact information are genuine</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
            <p className="text-amber-800 font-semibold text-xs mb-1">False Submission = Fraud</p>
            <p className="text-amber-700 text-xs">
              Submitting false information may constitute fraud under applicable state and federal
              statutes, including wire fraud (18 U.S.C. § 1343). WaitingTheLongest.com will pursue
              civil damages for provably false submissions and will cooperate fully with law
              enforcement investigations.
            </p>
          </div>
        </Section>

        <Section title="4. No Commercial Transactions">
          <p>The Service is for charitable animal placement only. You agree that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You will not request, suggest, or accept payment for the dog beyond documented shelter adoption fees</li>
            <li>You will not use this platform for any commercial animal sale, trade, auction, or exchange</li>
            <li>Adoption fees must be genuine shelter/rescue fees covering veterinary costs — not profit-generating prices</li>
            <li>You will not use WaitingTheLongest.com to promote a for-profit breeding operation or service</li>
          </ul>
        </Section>

        <Section title="5. No Impersonation">
          <p>You may not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Claim to be a shelter or rescue you are not affiliated with</li>
            <li>Submit on behalf of an organization without proper authorization</li>
            <li>Use a real organization&apos;s name, EIN, or credentials to create false legitimacy</li>
            <li>Submit a dog in another person&apos;s custody without their written consent</li>
          </ul>
        </Section>

        <Section title="6. Indemnification">
          <p>
            You agree to <strong>indemnify, defend, and hold harmless</strong> WaitingTheLongest.com,
            its operators, officers, affiliates, partners, and agents from and against any and all
            claims, damages, losses, liabilities, costs, and expenses (including reasonable
            attorneys&apos; fees) arising from or related to your submission, your breach of these Terms,
            any infringement claim relating to your content, or any harm to an adopter or animal
            resulting from inaccurate information in your submission.
          </p>
        </Section>

        <Section title="7. Privacy and Data Use">
          <p>When you submit a dog, we collect your name, email, phone, organization details, and submitted dog information and photos.</p>
          <p>We use this information to verify your submission, communicate with you about its status, and display your organization&apos;s public information on dog listings.</p>
          <p><strong>We never sell your personal information to third parties.</strong></p>
          <p>
            If you opt in to marketing communications, you may unsubscribe at any time by clicking
            &ldquo;Unsubscribe&rdquo; in any email or contacting{" "}
            <a href="mailto:privacy@waitingthelongest.com" className="text-wtl-sky hover:underline">
              privacy@waitingthelongest.com
            </a>.
          </p>
          <p>
            EU/EEA and California residents have additional rights under GDPR and CCPA. Contact{" "}
            <a href="mailto:privacy@waitingthelongest.com" className="text-wtl-sky hover:underline">
              privacy@waitingthelongest.com
            </a>{" "}
            to exercise your rights.
          </p>
        </Section>

        <Section title="8. Platform Discretion">
          <p>
            WaitingTheLongest.com reserves the right to approve or reject any submission for any
            reason, remove any listing at any time without notice, modify submitted content for
            clarity, permanently ban any submitter who violates these Terms, and require additional
            verification at any time.
          </p>
          <p>Submission does not guarantee listing. We are not obligated to publish any submission.</p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p className="uppercase text-xs">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND.
            WAITINGTHELONGEST.COM MAKES NO WARRANTIES REGARDING UPTIME, ACCURACY, OR FITNESS
            FOR ANY PARTICULAR PURPOSE. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p className="uppercase text-xs">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WAITINGTHELONGEST.COM SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING
            FROM YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by the laws of the Commonwealth of Massachusetts, without
            regard to conflict of law principles. Any dispute arising from these Terms shall be
            resolved in the courts of Suffolk County, Massachusetts.
          </p>
        </Section>

        <Section title="12. Contact">
          <ul className="list-none space-y-1">
            <li>Legal questions: <a href="mailto:legal@waitingthelongest.com" className="text-wtl-sky hover:underline">legal@waitingthelongest.com</a></li>
            <li>Privacy: <a href="mailto:privacy@waitingthelongest.com" className="text-wtl-sky hover:underline">privacy@waitingthelongest.com</a></li>
            <li>Abuse reports: <a href="mailto:abuse@waitingthelongest.com" className="text-wtl-sky hover:underline">abuse@waitingthelongest.com</a></li>
          </ul>
        </Section>

        {/* Footer note */}
        <div className="bg-wtl-coral/10 rounded-xl p-5 mt-8">
          <p className="text-sm text-wtl-navy/80 italic leading-relaxed">
            &ldquo;These Terms exist because we care about dogs, not because we trust everyone who
            submits them. We have seen breeders disguise themselves as rescues. We have seen false
            dogs. We take this seriously — every fraudulent submission is a wasted chance for a
            real dog to get seen. If you&apos;re here for the right reasons, these Terms will never
            affect you.&rdquo;
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/submit" className="btn-primary">
            Return to Submission Form
          </Link>
        </div>
      </div>
    </div>
  );
}
