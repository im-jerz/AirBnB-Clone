import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { STEP_DEFS, emptyPropertyDraft, validateStep, validateAll } from "./propertyDraft";
import { useToast } from "../../components/common/Toast";
import { IconCheck, IconChevronLeft } from "../../components/icons";
import { createProperty, updateProperty, savePropertyDraft } from "../../api/properties";
import { MOCK_PROPERTIES } from "../../data/mockProperties";

import StepBasics from "./steps/StepBasics";
import StepLocation from "./steps/StepLocation";
import StepCapacity from "./steps/StepCapacity";
import StepAmenities from "./steps/StepAmenities";
import StepRules from "./steps/StepRules";
import StepPhotos from "./steps/StepPhotos";
import StepPricing from "./steps/StepPricing";
import StepCancellation from "./steps/StepCancellation";
import StepReview from "./steps/StepReview";

const USE_MOCK = true;

function draftFromExisting(property) {
  const draft = emptyPropertyDraft();
  draft.basics = {
    property_type: property.property_type,
    title: property.title,
    description: property.description || "A wonderful place to stay, full of charm and comfort.",
    category: property.category,
  };
  draft.location = {
    street: property.address.street || "123 Sample Street",
    city: property.address.city,
    province: property.address.province,
    zip_code: property.address.zip_code || "0000",
    country: "Philippines",
    lat: 0.5,
    lng: 0.5,
  };
  draft.capacity = {
    max_guests: property.max_guests,
    bedrooms: property.bedrooms,
    beds: property.beds,
    bathrooms: property.bathrooms,
  };
  draft.photos = {
    files: [{ id: "existing-cover", url: property.cover_photo, name: "cover.jpg" }],
    coverId: "existing-cover",
  };
  draft.pricing = {
    base_price: String(property.base_price),
    cleaning_fee: String(property.cleaning_fee || ""),
    weekend_price: "",
    min_nights: 1,
    max_nights: 30,
  };
  draft.cancellation = { policy: property.cancellation_policy };
  return draft;
}

export default function AddEditProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { push } = useToast();

  const [draft, setDraft] = useState(emptyPropertyDraft());
  const [stepIndex, setStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const [touchedSteps, setTouchedSteps] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveTimer = useRef(null);

  // Pre-fill on edit
  useEffect(() => {
    if (isEdit) {
      const existing = MOCK_PROPERTIES.find((p) => String(p.property_id) === String(id));
      if (existing) setDraft(draftFromExisting(existing));
    }
  }, [isEdit, id]);

  // Auto-save draft every 30s (per spec: "Draft saved" toast)
  useEffect(() => {
    if (isEdit) return; // no autosave drafts on edit flow
    autosaveTimer.current = window.setInterval(async () => {
      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 300));
        } else {
          await savePropertyDraft(draft);
        }
        setLastSaved(new Date());
        push("Draft saved", "info", 2200);
      } catch {
        // Silent fail on autosave — don't interrupt the host's flow.
      }
    }, 30000);
    return () => window.clearInterval(autosaveTimer.current);
  }, [draft, isEdit, push]);

  const currentStep = STEP_DEFS[stepIndex];

  function updateSection(sectionKey, value) {
    setDraft((d) => ({ ...d, [sectionKey]: value }));
  }

  function goToStep(targetIndexOrKey) {
    const targetIndex =
      typeof targetIndexOrKey === "number" ? targetIndexOrKey : STEP_DEFS.findIndex((s) => s.key === targetIndexOrKey);
    setStepIndex(targetIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (currentStep.key !== "review") {
      const errs = validateStep(currentStep.key, draft);
      setStepErrors((e) => ({ ...e, [currentStep.key]: errs }));
      setTouchedSteps((t) => ({ ...t, [currentStep.key]: true }));
      if (Object.keys(errs).length > 0) return;
    }
    if (stepIndex < STEP_DEFS.length - 1) goToStep(stepIndex + 1);
  }

  function handleBack() {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  async function handleSubmit() {
    const allErrors = validateAll(draft);
    if (Object.keys(allErrors).length > 0) {
      setStepErrors(allErrors);
      setTouchedSteps(Object.fromEntries(STEP_DEFS.map((s) => [s.key, true])));
      const firstBadStep = STEP_DEFS.findIndex((s) => allErrors[s.key]);
      if (firstBadStep >= 0) goToStep(firstBadStep);
      push("Some steps need your attention before submitting.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        basics: draft.basics,
        location: draft.location,
        capacity: draft.capacity,
        amenities: draft.amenities,
        rules: draft.rules,
        pricing: draft.pricing,
        cancellation_policy: draft.cancellation.policy,
      };
      const photoFiles = draft.photos.files.map((f) => f.file).filter(Boolean);

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 900));
      } else if (isEdit) {
        await updateProperty(id, payload, photoFiles);
      } else {
        await createProperty(payload, photoFiles);
      }

      push(
        isEdit
          ? "Changes saved. Listing updates may require a quick re-review."
          : "Property submitted for approval. We'll notify you once it's live.",
        "success"
      );
      navigate("/dashboard/properties");
    } catch (err) {
      push(err.response?.data?.message || "Couldn't submit your property. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    const errs = stepErrors[currentStep.key] || {};
    switch (currentStep.key) {
      case "basics":
        return <StepBasics data={draft.basics} errors={errs} onChange={(v) => updateSection("basics", v)} />;
      case "location":
        return <StepLocation data={draft.location} errors={errs} onChange={(v) => updateSection("location", v)} />;
      case "capacity":
        return <StepCapacity data={draft.capacity} errors={errs} onChange={(v) => updateSection("capacity", v)} />;
      case "amenities":
        return <StepAmenities data={draft.amenities} onChange={(v) => updateSection("amenities", v)} />;
      case "rules":
        return <StepRules data={draft.rules} errors={errs} onChange={(v) => updateSection("rules", v)} />;
      case "photos":
        return <StepPhotos data={draft.photos} errors={errs} onChange={(v) => updateSection("photos", v)} />;
      case "pricing":
        return <StepPricing data={draft.pricing} errors={errs} onChange={(v) => updateSection("pricing", v)} />;
      case "cancellation":
        return <StepCancellation data={draft.cancellation} errors={errs} onChange={(v) => updateSection("cancellation", v)} />;
      case "review":
        return <StepReview draft={draft} onEditStep={goToStep} />;
      default:
        return null;
    }
  }

  return (
    <div className="builder-shell">
      <button type="button" className="btn-inline btn-ghost" style={{ width: "fit-content", paddingLeft: 0 }} onClick={() => navigate("/dashboard/properties")}>
        <IconChevronLeft /> Back to properties
      </button>

      <div className="builder-progress-wrap">
        <div className="builder-progress">
          {STEP_DEFS.map((step, idx) => {
            const hasError = touchedSteps[step.key] && stepErrors[step.key] && Object.keys(stepErrors[step.key]).length > 0;
            const isDone = idx < stepIndex && !hasError;
            const isActive = idx === stepIndex;
            return (
              <div className="builder-step" key={step.key}>
                <button
                  type="button"
                  className={`builder-step-btn ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${hasError ? "has-error" : ""}`}
                  onClick={() => goToStep(idx)}
                >
                  <span className="builder-step-circle">{isDone ? <IconCheck width={16} height={16} /> : idx + 1}</span>
                  <span className="builder-step-label">{step.label}</span>
                </button>
                {idx < STEP_DEFS.length - 1 && <span className={`builder-step-connector ${isDone ? "done" : ""}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="builder-panel">{renderStep()}</div>

      <div className="builder-footer">
        <div className="draft-save-indicator">
          {!isEdit && lastSaved && (
            <>
              <IconCheck width={15} height={15} />
              Draft saved {lastSaved.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
            </>
          )}
        </div>
        <div className="builder-footer-actions">
          {stepIndex > 0 && (
            <button type="button" className="btn-inline btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          {currentStep.key === "review" ? (
            <button type="button" className="btn-inline btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : isEdit ? "Save changes" : "Submit for approval"}
            </button>
          ) : (
            <button type="button" className="btn-inline btn-primary" onClick={handleNext}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
