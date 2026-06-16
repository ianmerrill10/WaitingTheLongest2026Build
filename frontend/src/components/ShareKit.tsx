"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ShareKitProps {
  /** Dog's name */
  dogName: string;
  /** Dog's primary breed */
  breed: string;
  /** Human-readable wait time, e.g. "847 days" */
  waitTime: string;
  /** Full dog profile URL */
  dogUrl: string;
  /** Dog's primary photo URL (for Instagram card) */
  primaryPhotoUrl?: string;
  /** Optional heading */
  heading?: string;
}

// TikTok / Instagram / Facebook / Twitter share text templates
function buildText(dogName: string, breed: string, waitTime: string, url: string) {
  return {
    tiktok: `Meet ${dogName}, a ${breed} who has been waiting ${waitTime} for a home 💔 Help share this dog's story: ${url} #AdoptDontShop #WaitingTheLongest #LongestWaiting #RescueDog`,
    instagram: `Meet ${dogName} 🐾\n\nThis ${breed} has been waiting ${waitTime} for a forever home.\n\nEvery day that passes without a family is a day too long. Share this post — your friends might be the ones to change ${dogName}'s life.\n\n${url}\n\n#AdoptDontShop #WaitingTheLongest #RescueDog #ShelterDog #LongestWaiting #AdoptMe`,
    facebook: `Have you met ${dogName}?\n\nThis ${breed} has been in shelter care for ${waitTime}. That's not a typo.\n\nWaitingTheLongest.com surfaces dogs who have been waiting the longest — because they deserve a chance too. Please share this post. Somewhere out there is ${dogName}'s person.\n\n${url}`,
    twitter: `Meet ${dogName}, a ${breed} who has been waiting ${waitTime} for a home 💔\n\nPlease RT — someone you know might be their person.\n\n${url}\n\n#AdoptDontShop #WaitingTheLongest`,
  };
}

type Platform = "tiktok" | "instagram" | "facebook" | "twitter" | "link";

interface ShareButtonProps {
  platform: Platform;
  label: string;
  color: string;
  onClick: () => void;
  copied: boolean;
}

function ShareButton({ platform, label, color, onClick, copied }: ShareButtonProps) {
  const icons: Record<Platform, string> = {
    tiktok: "𝕋",
    instagram: "📸",
    facebook: "𝔽",
    twitter: "𝕏",
    link: "🔗",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 ${color}`}
    >
      <span className="text-base leading-none">{icons[platform]}</span>
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        label
      )}
    </button>
  );
}

/**
 * ShareKit — pre-filled social sharing buttons for a dog profile.
 *
 * Clicking any platform button copies the platform-specific share text to
 * clipboard and (for Facebook/Twitter) opens the native share dialog.
 * TikTok and Instagram don't support native web share — so we copy the text
 * so the user can paste it into the app.
 */
export function ShareKit({
  dogName,
  breed,
  waitTime,
  dogUrl,
  heading = "Share This Dog",
}: ShareKitProps) {
  const [copied, setCopied] = useState<Platform | null>(null);
  const [activeText, setActiveText] = useState<string | null>(null);

  const text = buildText(dogName, breed, waitTime, dogUrl);

  function copyToClipboard(platform: Platform, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(platform);
      setActiveText(content);
      setTimeout(() => setCopied(null), 2500);
    });
  }

  function openShareUrl(url: string) {
    window.open(url, "_blank", "noopener,width=600,height=500");
  }

  const shareActions: Record<Platform, () => void> = {
    tiktok: () => copyToClipboard("tiktok", text.tiktok),
    instagram: () => copyToClipboard("instagram", text.instagram),
    facebook: () =>
      openShareUrl(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dogUrl)}&quote=${encodeURIComponent(text.facebook.slice(0, 500))}`
      ),
    twitter: () =>
      openShareUrl(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.twitter)}`
      ),
    link: () => copyToClipboard("link", dogUrl),
  };

  const buttons: { platform: Platform; label: string; color: string }[] = [
    { platform: "tiktok", label: "TikTok", color: "bg-black" },
    { platform: "instagram", label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { platform: "facebook", label: "Facebook", color: "bg-blue-600" },
    { platform: "twitter", label: "Post on X", color: "bg-gray-900" },
    { platform: "link", label: "Copy Link", color: "bg-wtl-sky" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-display text-lg font-bold text-wtl-navy mb-1">{heading}</h3>
      <p className="text-sm text-wtl-muted mb-4">
        Sharing takes 10 seconds. It could change {dogName}&apos;s life.
      </p>

      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <ShareButton
            key={b.platform}
            platform={b.platform}
            label={b.label}
            color={b.color}
            onClick={shareActions[b.platform]}
            copied={copied === b.platform}
          />
        ))}
      </div>

      {/* Show the copied text so the user knows what to paste */}
      {activeText && copied && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-wtl-muted mb-1 font-semibold">Copied to clipboard — paste into the app:</p>
          <p className="text-xs text-wtl-navy leading-relaxed whitespace-pre-line line-clamp-4">
            {activeText}
          </p>
        </div>
      )}

      <p className="text-xs text-wtl-muted mt-3">
        <ExternalLink className="w-3 h-3 inline mr-0.5" />
        TikTok/Instagram: text copied → open the app → paste in caption
      </p>
    </div>
  );
}
