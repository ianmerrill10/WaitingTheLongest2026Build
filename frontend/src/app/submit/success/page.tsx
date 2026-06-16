import { Suspense } from "react";
import Link from "next/link";
import { Heart, Check, Clock, Share2 } from "lucide-react";
import { ShareKit } from "@/components/ShareKit";

// This page is the confirmation screen after a successful submission.
// Dog name and submission ID come from query params set by the submit form.

interface Props {
  searchParams: Promise<{ dog?: string; id?: string }>;
}

function SuccessContent({ dogName, submissionId }: { dogName: string; submissionId: string }) {
  const dogUrl = `https://waitingthelongest.com/dogs/pending`; // Real URL after approval

  return (
    <div className="bg-wtl-cream min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-wtl-sage/20 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-wtl-sage" strokeWidth={3} />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-wtl-navy mb-3">
            {dogName ? `${dogName} is in the queue! 🐾` : "Submission received!"}
          </h1>
          <p className="text-wtl-muted leading-relaxed">
            We&apos;ve received your submission and will review it within 24 hours.
            Once approved, {dogName || "your dog"} will appear on WaitingTheLongest.com with a
            live counter showing exactly how long they&apos;ve been waiting.
          </p>
          {submissionId && (
            <p className="text-xs text-wtl-muted mt-3 font-mono">
              Submission ID: {submissionId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-wtl-navy mb-4">What Happens Next</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-wtl-coral rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-wtl-navy">Review (within 24 hours)</p>
                <p className="text-xs text-wtl-muted">
                  Our team reviews your submission to verify the information and approve the listing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-wtl-coral rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-wtl-navy">Goes Live</p>
                <p className="text-xs text-wtl-muted">
                  {dogName || "Your dog"} appears on the site with a live wait counter ticking from their
                  intake date. The longer they wait, the higher they rank.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-wtl-coral rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-wtl-navy">You Get Notified</p>
                <p className="text-xs text-wtl-muted">
                  We&apos;ll email you when the listing goes live with a shareable link.
                  Then it&apos;s time to post everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share kit — share while waiting for approval */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-wtl-coral" />
            <p className="text-sm font-semibold text-wtl-navy">
              Don&apos;t wait for approval — share now
            </p>
          </div>
          <ShareKit
            dogName={dogName || "this dog"}
            breed="rescue dog"
            waitTime="too long"
            dogUrl={dogUrl}
            heading={`Share ${dogName || "this dog"}'s story`}
          />
        </div>

        {/* Why share matters */}
        <div className="bg-wtl-coral/10 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-wtl-coral flex-shrink-0 mt-0.5" />
          <p className="text-sm text-wtl-navy/80 leading-relaxed">
            Every share reaches people who might be looking for exactly this dog. Most adoptions
            happen within the first 72 hours of a listing going viral. Post now.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dogs" className="btn-primary text-center flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Browse Other Dogs
          </Link>
          <Link
            href="/submit"
            className="flex-1 text-center border-2 border-wtl-navy text-wtl-navy rounded-xl py-3 px-6 text-sm font-semibold hover:bg-wtl-navy hover:text-white transition-colors"
          >
            Submit Another Dog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function SubmitSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const dogName = params.dog ? decodeURIComponent(params.dog) : "";
  const submissionId = params.id ?? "";

  return (
    <Suspense fallback={<div className="min-h-screen bg-wtl-cream" />}>
      <SuccessContent dogName={dogName} submissionId={submissionId} />
    </Suspense>
  );
}
