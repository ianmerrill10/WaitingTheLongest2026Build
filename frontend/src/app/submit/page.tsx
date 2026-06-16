"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Building2,
  Landmark,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubmitterType = "individual" | "rescue" | "shelter";
type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1
  submitter_type: SubmitterType | "";

  // Step 2 — Individual
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  submitter_social: string;

  // Step 2 — Rescue / Shelter
  org_name: string;
  org_website: string;
  org_ein: string;

  // Step 3 — Dog details
  dog_name: string;
  intake_date: string;
  breed_primary: string;
  breed_secondary: string;
  is_mixed: boolean;
  age_months: string;
  size: string;
  sex: string;
  altered: string;
  description: string;
  good_with_dogs: string;
  good_with_cats: string;
  good_with_kids: string;
  special_needs: boolean;
  special_needs_desc: string;
  location_city: string;
  location_state: string;
  listing_url: string;

  // Step 5 — Legal
  agreed_accuracy: boolean;
  agreed_terms: boolean;
  agreed_marketing: boolean;
}

const INITIAL_FORM: FormData = {
  submitter_type: "",
  submitter_name: "",
  submitter_email: "",
  submitter_phone: "",
  submitter_social: "",
  org_name: "",
  org_website: "",
  org_ein: "",
  dog_name: "",
  intake_date: "",
  breed_primary: "",
  breed_secondary: "",
  is_mixed: false,
  age_months: "",
  size: "",
  sex: "",
  altered: "unknown",
  description: "",
  good_with_dogs: "unknown",
  good_with_cats: "unknown",
  good_with_kids: "unknown",
  special_needs: false,
  special_needs_desc: "",
  location_city: "",
  location_state: "",
  listing_url: "",
  agreed_accuracy: false,
  agreed_terms: false,
  agreed_marketing: false,
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEP_LABELS: Record<Step, string> = {
  1: "Who Are You?",
  2: "Verify",
  3: "Dog Details",
  4: "Photos",
  5: "Legal",
};

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {([1, 2, 3, 4, 5] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                s < current
                  ? "bg-wtl-sage border-wtl-sage text-white"
                  : s === current
                  ? "bg-wtl-coral border-wtl-coral text-white"
                  : "bg-white border-gray-200 text-wtl-muted"
              }`}
            >
              {s < current ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className="text-xs mt-1 text-wtl-muted hidden sm:block">
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < 4 && (
            <div
              className={`flex-1 h-0.5 mx-1 transition-colors ${
                s < current ? "bg-wtl-sage" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-wtl-navy mb-1">
        {label}
        {required && <span className="text-wtl-coral ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-wtl-muted mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-wtl-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wtl-coral/40 focus:border-wtl-coral transition-colors";

const selectCls = inputCls + " bg-white";

function CompatSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={selectCls}
      >
        <option value="unknown">Unknown</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
        <option value="selective">Selective</option>
      </select>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function Step1({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const types: { type: SubmitterType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: "individual",
      label: "Individual",
      desc: "I have personal custody of a dog who needs a home",
      icon: <User className="w-6 h-6" />,
    },
    {
      type: "rescue",
      label: "Rescue / Foster Network",
      desc: "I represent a rescue organization or foster network",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      type: "shelter",
      label: "Shelter / Animal Control",
      desc: "I represent a licensed shelter or animal control agency",
      icon: <Landmark className="w-6 h-6" />,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">Who Are You?</h2>
      <p className="text-wtl-muted text-sm mb-6">
        Select the option that best describes your relationship to the dog you&apos;re submitting.
      </p>
      <div className="space-y-3">
        {types.map(({ type, label, desc, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => setForm({ ...form, submitter_type: type })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-start gap-4 ${
              form.submitter_type === type
                ? "border-wtl-coral bg-wtl-coral/5"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div
              className={`mt-0.5 flex-shrink-0 ${
                form.submitter_type === type ? "text-wtl-coral" : "text-wtl-muted"
              }`}
            >
              {icon}
            </div>
            <div>
              <p className="font-semibold text-wtl-navy">{label}</p>
              <p className="text-sm text-wtl-muted">{desc}</p>
            </div>
            {form.submitter_type === type && (
              <Check className="w-5 h-5 text-wtl-coral ml-auto mt-0.5 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({
  form,
  setForm,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
}) {
  const type = form.submitter_type as SubmitterType;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">Your Information</h2>
      <p className="text-wtl-muted text-sm mb-6">
        We use this to contact you about your submission. It is never displayed publicly.
      </p>

      {/* Always: full name + email */}
      <Field label="Your Full Name" required>
        <input
          type="text"
          value={form.submitter_name}
          onChange={e => setForm({ ...form, submitter_name: e.target.value })}
          placeholder="Jane Smith"
          className={inputCls}
        />
      </Field>

      <Field label="Email Address" required>
        <input
          type="email"
          value={form.submitter_email}
          onChange={e => setForm({ ...form, submitter_email: e.target.value })}
          placeholder="jane@example.com"
          className={inputCls}
        />
      </Field>

      <Field label="Phone Number">
        <input
          type="tel"
          value={form.submitter_phone}
          onChange={e => setForm({ ...form, submitter_phone: e.target.value })}
          placeholder="(555) 000-0000"
          className={inputCls}
        />
      </Field>

      {/* Individual: social handle */}
      {type === "individual" && (
        <Field label="Social Media Handle" hint="Instagram, TikTok, or Facebook — helps us verify and build your dog's story">
          <input
            type="text"
            value={form.submitter_social}
            onChange={e => setForm({ ...form, submitter_social: e.target.value })}
            placeholder="@yourhandle"
            className={inputCls}
          />
        </Field>
      )}

      {/* Rescue / Shelter: org info */}
      {(type === "rescue" || type === "shelter") && (
        <>
          <Field label="Organization Name" required>
            <input
              type="text"
              value={form.org_name}
              onChange={e => setForm({ ...form, org_name: e.target.value })}
              placeholder="Happy Paws Rescue"
              className={inputCls}
            />
          </Field>
          <Field label="Organization Website or Social Media">
            <input
              type="url"
              value={form.org_website}
              onChange={e => setForm({ ...form, org_website: e.target.value })}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
          <Field
            label={type === "shelter" ? "EIN (Required for Shelters)" : "EIN / Tax ID (Optional)"}
            required={type === "shelter"}
            hint={type === "shelter" ? "9-digit federal employer identification number" : "Providing your EIN helps us verify your organization"}
          >
            <input
              type="text"
              value={form.org_ein}
              onChange={e => setForm({ ...form, org_ein: e.target.value })}
              placeholder="12-3456789"
              className={inputCls}
            />
          </Field>
        </>
      )}
    </div>
  );
}

function Step3({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const charCount = form.description.length;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">Tell Us About the Dog</h2>
      <p className="text-wtl-muted text-sm mb-6">
        The intake date is the most important field — it starts the clock on the wait counter.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Dog's Name" required>
          <input
            type="text"
            value={form.dog_name}
            onChange={e => setForm({ ...form, dog_name: e.target.value })}
            placeholder="Biscuit"
            className={inputCls}
          />
        </Field>

        <Field
          label="Intake Date"
          required
          hint="Date the dog entered shelter/rescue/foster care"
        >
          <input
            type="date"
            value={form.intake_date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setForm({ ...form, intake_date: e.target.value })}
            className={inputCls}
          />
        </Field>

        <Field label="Primary Breed" required>
          <input
            type="text"
            value={form.breed_primary}
            onChange={e => setForm({ ...form, breed_primary: e.target.value })}
            placeholder="Labrador Retriever"
            className={inputCls}
          />
        </Field>

        <Field label="Secondary Breed (if mixed)">
          <input
            type="text"
            value={form.breed_secondary}
            onChange={e => setForm({ ...form, breed_secondary: e.target.value })}
            placeholder="German Shepherd"
            className={inputCls}
          />
        </Field>

        <Field label="Age (approximate)">
          <select
            value={form.age_months}
            onChange={e => setForm({ ...form, age_months: e.target.value })}
            className={selectCls}
          >
            <option value="">Unknown</option>
            <option value="2">Under 6 months</option>
            <option value="9">6–12 months</option>
            <option value="18">1–2 years</option>
            <option value="36">2–4 years</option>
            <option value="60">4–7 years</option>
            <option value="96">7–10 years</option>
            <option value="132">10+ years</option>
          </select>
        </Field>

        <Field label="Size">
          <select
            value={form.size}
            onChange={e => setForm({ ...form, size: e.target.value })}
            className={selectCls}
          >
            <option value="">Unknown</option>
            <option value="small">Small (under 25 lbs)</option>
            <option value="medium">Medium (25–60 lbs)</option>
            <option value="large">Large (60–100 lbs)</option>
            <option value="xlarge">XL (over 100 lbs)</option>
          </select>
        </Field>

        <Field label="Sex">
          <select
            value={form.sex}
            onChange={e => setForm({ ...form, sex: e.target.value })}
            className={selectCls}
          >
            <option value="">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>

        <Field label="Spayed / Neutered">
          <select
            value={form.altered}
            onChange={e => setForm({ ...form, altered: e.target.value })}
            className={selectCls}
          >
            <option value="unknown">Unknown</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>

        <Field label="City" required>
          <input
            type="text"
            value={form.location_city}
            onChange={e => setForm({ ...form, location_city: e.target.value })}
            placeholder="Boston"
            className={inputCls}
          />
        </Field>

        <Field label="State" required>
          <select
            value={form.location_state}
            onChange={e => setForm({ ...form, location_state: e.target.value })}
            className={selectCls}
          >
            <option value="">Select state</option>
            {US_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <CompatSelect
        label="Good with Dogs?"
        value={form.good_with_dogs}
        onChange={v => setForm({ ...form, good_with_dogs: v })}
      />
      <CompatSelect
        label="Good with Cats?"
        value={form.good_with_cats}
        onChange={v => setForm({ ...form, good_with_cats: v })}
      />
      <CompatSelect
        label="Good with Kids?"
        value={form.good_with_kids}
        onChange={v => setForm({ ...form, good_with_kids: v })}
      />

      <Field label="Special Needs?">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.special_needs}
            onChange={e => setForm({ ...form, special_needs: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-wtl-coral focus:ring-wtl-coral"
          />
          <span className="text-sm text-wtl-navy">This dog has special needs</span>
        </label>
      </Field>

      {form.special_needs && (
        <Field label="Special Needs Description">
          <input
            type="text"
            value={form.special_needs_desc}
            onChange={e => setForm({ ...form, special_needs_desc: e.target.value })}
            placeholder="e.g. diabetic, blind in one eye, requires daily medication"
            className={inputCls}
          />
        </Field>
      )}

      <Field
        label="Description"
        hint={`${charCount}/500 characters`}
      >
        <textarea
          value={form.description}
          onChange={e => {
            if (e.target.value.length <= 500) {
              setForm({ ...form, description: e.target.value });
            }
          }}
          rows={4}
          placeholder="Tell us about this dog's personality, history, and what kind of home they need..."
          className={inputCls + " resize-none"}
        />
        {charCount > 450 && (
          <p className="text-xs text-wtl-coral mt-1">{500 - charCount} characters remaining</p>
        )}
      </Field>

      <Field label="Existing Listing URL" hint="Optional — Chewy Rescue, RescueGroups, shelter website, etc.">
        <input
          type="url"
          value={form.listing_url}
          onChange={e => setForm({ ...form, listing_url: e.target.value })}
          placeholder="https://..."
          className={inputCls}
        />
      </Field>
    </div>
  );
}

function Step4({
  photos,
  onAdd,
  onRemove,
}: {
  photos: File[];
  onAdd: (files: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files)
      .filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
      .slice(0, 5 - photos.length);
    onAdd(valid);
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">Photos</h2>
      <p className="text-wtl-muted text-sm mb-6">
        Upload 1–5 photos (JPG or PNG, max 10 MB each). The first photo will be the primary image.
        Good photos make adoption 3× more likely.
      </p>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer mb-4 ${
          dragOver ? "border-wtl-coral bg-wtl-coral/5" : "border-gray-300 hover:border-gray-400"
        } ${photos.length >= 5 ? "opacity-40 pointer-events-none" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="w-8 h-8 text-wtl-muted mx-auto mb-3" />
        <p className="text-sm font-semibold text-wtl-navy">
          {photos.length >= 5 ? "Maximum 5 photos" : "Click or drag photos here"}
        </p>
        <p className="text-xs text-wtl-muted mt-1">JPG, PNG — max 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((f, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(f)}
                alt={`Photo ${i + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-wtl-coral text-white text-xs px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <p className="text-center text-sm text-wtl-muted">
          No photos yet — you can still submit without a photo, but a photo is{" "}
          <strong>strongly recommended</strong>.
        </p>
      )}
    </div>
  );
}

function Step5({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const termsRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  function handleScroll() {
    const el = termsRef.current;
    if (!el) return;
    // Enable checkbox once user is within 80px of bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setHasScrolled(true);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">Legal Agreement</h2>
      <p className="text-wtl-muted text-sm mb-4">
        Read and agree to our submission terms before submitting.
      </p>

      {/* Scrollable terms summary */}
      <div
        ref={termsRef}
        onScroll={handleScroll}
        className="border border-gray-200 rounded-xl p-4 h-56 overflow-y-auto text-xs text-wtl-navy/80 leading-relaxed mb-4 bg-gray-50"
      >
        <p className="font-bold mb-2">Submission Terms Summary</p>
        <p className="mb-2">
          By submitting a dog through this form, you confirm that you have legal custody or
          caretaking authority over the dog, and that all information you provide is accurate
          and truthful.
        </p>
        <p className="mb-2">
          <strong>Content License:</strong> You grant WaitingTheLongest.com a permanent,
          worldwide, royalty-free license to use all submitted content (photos, descriptions,
          dog information) for any marketing or promotional purpose, including social media,
          press, and advertising.
        </p>
        <p className="mb-2">
          <strong>No Commercial Sales:</strong> This platform is for charitable animal placement
          only. Breeders, pet stores, and any person selling dogs for profit are strictly
          prohibited. Violation may result in legal action.
        </p>
        <p className="mb-2">
          <strong>Accuracy:</strong> False submissions may constitute fraud under applicable law.
          WaitingTheLongest.com will pursue civil remedies and cooperate with law enforcement
          for fraudulent submissions.
        </p>
        <p className="mb-2">
          <strong>No Impersonation:</strong> You may not claim to be a shelter or rescue you
          are not affiliated with.
        </p>
        <p className="mb-2">
          <strong>Indemnification:</strong> You agree to indemnify WaitingTheLongest.com
          against all claims arising from your submission.
        </p>
        <p className="mb-2">
          <strong>Privacy:</strong> Your personal contact information is never displayed
          publicly. We may contact you about your submission.
        </p>
        <p>
          By checking the boxes below, you confirm you have read and agree to the full{" "}
          <Link href="/terms/submission" target="_blank" className="text-wtl-sky underline">
            Submission Terms of Service
          </Link>
          .
        </p>
        {/* Scroll indicator so user knows they need to read */}
        <p className="mt-4 text-center text-wtl-muted text-xs animate-bounce">↓ scroll to continue ↓</p>
      </div>

      {!hasScrolled && (
        <p className="text-xs text-amber-600 flex items-center gap-1 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          Please scroll through the terms above before agreeing.
        </p>
      )}

      <div className="space-y-3">
        <label
          className={`flex items-start gap-3 cursor-pointer ${!hasScrolled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            type="checkbox"
            checked={form.agreed_accuracy}
            onChange={e => setForm({ ...form, agreed_accuracy: e.target.checked })}
            className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-gray-300 text-wtl-coral focus:ring-wtl-coral"
          />
          <span className="text-sm text-wtl-navy">
            I confirm that all information I have provided is accurate to the best of my
            knowledge, and that I have legal right to post this dog.
          </span>
        </label>

        <label
          className={`flex items-start gap-3 cursor-pointer ${!hasScrolled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            type="checkbox"
            checked={form.agreed_terms}
            onChange={e => setForm({ ...form, agreed_terms: e.target.checked })}
            className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-gray-300 text-wtl-coral focus:ring-wtl-coral"
          />
          <span className="text-sm text-wtl-navy">
            I agree to the{" "}
            <Link href="/terms/submission" target="_blank" className="text-wtl-sky underline">
              WaitingTheLongest.com Submission Terms of Service
            </Link>
            , including the content license and no-sale policy.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.agreed_marketing}
            onChange={e => setForm({ ...form, agreed_marketing: e.target.checked })}
            className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-gray-300 text-wtl-coral focus:ring-wtl-coral"
          />
          <span className="text-sm text-wtl-muted">
            I agree to receive occasional updates about my dog&apos;s listing and
            WaitingTheLongest.com news. (Optional — you can unsubscribe at any time.)
          </span>
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation per step
// ---------------------------------------------------------------------------

function validateStep(step: Step, form: FormData): string | null {
  if (step === 1 && !form.submitter_type) return "Please select who you are.";
  if (step === 2) {
    if (!form.submitter_name.trim()) return "Name is required.";
    if (!form.submitter_email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email)) return "Enter a valid email address.";
    if ((form.submitter_type === "rescue" || form.submitter_type === "shelter") && !form.org_name.trim())
      return "Organization name is required.";
    if (form.submitter_type === "shelter" && !form.org_ein.trim())
      return "EIN is required for shelters.";
  }
  if (step === 3) {
    if (!form.dog_name.trim()) return "Dog name is required.";
    if (!form.intake_date) return "Intake date is required.";
    if (new Date(form.intake_date) > new Date()) return "Intake date cannot be in the future.";
    if (!form.breed_primary.trim()) return "Primary breed is required.";
    if (!form.location_city.trim()) return "City is required.";
    if (!form.location_state) return "State is required.";
  }
  if (step === 5) {
    if (!form.agreed_accuracy) return "Please confirm the accuracy checkbox.";
    if (!form.agreed_terms) return "Please agree to the Terms of Service.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function nextStep() {
    const err = validateStep(step, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 5) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const err = validateStep(5, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Upload photos to Supabase Storage first, collect public URLs
      const photoUrls: string[] = [];
      for (const file of photos) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("submission_id", "pending");
        const uploadRes = await fetch("/api/upload-photo", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrls.push(uploadData.url);
        }
        // Non-fatal: if a photo fails to upload, continue without it
      }

      const payload = {
        ...form,
        photo_urls: photoUrls,
        primary_photo_url: photoUrls[0] ?? null,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // Success — redirect to confirmation page
      router.push(`/submit/success?dog=${encodeURIComponent(form.dog_name)}&id=${data.submission_id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-wtl-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-wtl-muted hover:text-wtl-coral transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-wtl-navy">
              Submit a Dog
            </h1>
            <p className="text-sm text-wtl-muted">
              Help a dog get seen. It takes 5 minutes.
            </p>
          </div>
        </div>

        <StepBar current={step} />

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && (
            <Step4
              photos={photos}
              onAdd={(files) => setPhotos(prev => [...prev, ...files].slice(0, 5))}
              onRemove={(i) => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
            />
          )}
          {step === 5 && <Step5 form={form} setForm={setForm} />}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 text-sm text-wtl-muted hover:text-wtl-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !form.agreed_accuracy || !form.agreed_terms}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Submit Dog for Review
                </>
              )}
            </button>
          )}
        </div>

        {/* Trust signal */}
        <p className="text-center text-xs text-wtl-muted mt-6">
          Submissions are reviewed within 24 hours. We&apos;re here to save dogs, not process transactions.
        </p>
      </div>
    </div>
  );
}
