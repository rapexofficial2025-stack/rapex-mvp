import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsyncAction, useRepositories, type CompleteMerchantOnboardingResult } from "@rapex/api-client";
import { MerchantRegistrationShell } from "./MerchantRegistrationShell";

type PasswordStrength = "Weak" | "Normal" | "Strong";
const STEPS = ["Create account", "Verify", "Basic identity", "Main store", "Identity verification"] as const;

function getPasswordStrength(password: string): PasswordStrength {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (score >= 5) return "Strong";
  if (score >= 3) return "Normal";
  return "Weak";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="merchant-field"><span>{label}</span>{children}</label>;
}

/**
 * Wired to the real RAPEX Master Authentication Suite (same rapex-auth
 * group as Customer -- register()/login()/verifyOtp() are role-agnostic,
 * see XanoAuthRepository) plus the real 2026-08-21 Xano build of
 * POST /merchant/complete-onboarding. Xano's OTP is one shared code, not
 * two independent per-channel codes -- Step 2 sends one email OTP (via
 * login()) and one code field verifies it; the "mobile" column is labeled
 * honestly as using the same code rather than faking a second channel.
 * None of this has been tested against a live response yet.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, merchant, kyc } = useRepositories();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteMerchantOnboardingResult | null>(null);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const strength = getPasswordStrength(password);
  const previewMode = new URLSearchParams(location.search).get("preview") === "1";

  const register = useAsyncAction((input: { email: string; password: string; firstName: string; lastName: string; mobile: string }) =>
    auth.register({ ...input, role: "merchant" }),
  );
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));
  const verify = useAsyncAction((code: string) => auth.verifyOtp(code));

  function readStepFields(stepNumber: number): Record<string, string> {
    if (!formRef.current) return {};
    const fields = formRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `fieldset[data-step="${stepNumber}"] input, fieldset[data-step="${stepNumber}"] select, fieldset[data-step="${stepNumber}"] textarea`,
    );
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.name) values[field.name] = field.value;
    });
    return values;
  }

  async function continueTo(nextStep: number) {
    setFormError(null);
    setApiNotice(null);
    const fields = formRef.current?.querySelector<HTMLFieldSetElement>(`fieldset[data-step="${step}"]`);
    if (!previewMode && fields && !fields.reportValidity()) return;
    if (!previewMode && step === 1 && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!previewMode && step === 1 && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) {
      setFormError("Use at least 8 characters with both letters and numbers.");
      return;
    }

    if (previewMode) {
      setStep(nextStep);
      return;
    }

    if (step === 1) {
      const values = readStepFields(1);
      try {
        await register.execute({
          email: values.email ?? "",
          password,
          firstName: values.firstName ?? "",
          lastName: values.lastName ?? "",
          mobile: values.mobile ?? "",
        });
        await login.execute({ email: values.email ?? "", password });
        setStep(2);
      } catch {
        // Real Xano error already captured in register.error / login.error below.
      }
      return;
    }

    setStep(nextStep);
  }

  async function verifyCode() {
    setFormError(null);
    setApiNotice(null);
    if (previewMode) {
      setStep(3);
      return;
    }
    if (!otpCode) {
      setFormError("Enter the code sent to your email.");
      return;
    }
    try {
      await verify.execute(otpCode);
      setStep(3);
    } catch {
      // Real Xano error already captured in verify.error below.
    }
  }

  function goBack() {
    setApiNotice(null);
    setFormError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setApiNotice(null);

    if (previewMode) {
      setApiNotice("UI preview mode -- nothing submitted.");
      return;
    }

    const idFrontInput = formRef.current?.querySelector<HTMLInputElement>('input[name="idFront"]');
    const idBackInput = formRef.current?.querySelector<HTMLInputElement>('input[name="idBack"]');
    const selfieInput = formRef.current?.querySelector<HTMLInputElement>('input[name="selfieWithId"]');
    const idFrontFile = idFrontInput?.files?.[0];
    const idBackFile = idBackInput?.files?.[0];
    const selfieFile = selfieInput?.files?.[0];
    if (!idFrontFile || !idBackFile || !selfieFile) {
      setFormError("Upload ID front, ID back, and a selfie with ID before submitting.");
      return;
    }

    const step4 = readStepFields(4);
    const step5 = readStepFields(5);

    try {
      setUploadStage("Uploading ID front…");
      const idFrontAssetId = await kyc!.uploadAsset(idFrontFile);
      setUploadStage("Uploading ID back…");
      const idBackAssetId = await kyc!.uploadAsset(idBackFile);
      setUploadStage("Uploading selfie…");
      const selfieAssetId = await kyc!.uploadAsset(selfieFile);
      setUploadStage("Submitting application…");

      const outcome = await merchant.completeOnboarding({
        otpCode,
        idType: step5.idType ?? "",
        idFrontAssetId,
        idBackAssetId,
        selfieAssetId,
        storeName: step4.storeName ?? "",
        storeContact: step4.storeContact ?? "",
        storeCategory: step4.storeCategory ?? "",
        storeSubcategory: step4.storeSubcategory,
        storeDescription: step4.storeDescription ?? "",
        storeProvince: step4.storeProvince ?? "",
        storeCity: step4.storeCity ?? "",
        storeBarangay: step4.storeBarangay ?? "",
        storeAddress: step4.storeAddress ?? "",
        openingTime: step4.openingTime ?? "",
        closingTime: step4.closingTime ?? "",
      });
      setUploadStage(null);
      setResult(outcome);
    } catch (err) {
      setUploadStage(null);
      setApiNotice(err instanceof Error ? err.message : "Submission failed -- please try again.");
    }
  }

  if (result) {
    return (
      <MerchantRegistrationShell eyebrow="Merchant registration · Submitted" title="Application submitted" description="Your application is now under review.">
        <div className="merchant-alpha-scope">
          <span>{result.status}</span>
          <h2>Application ID: {result.applicationId || result.merchantCode}</h2>
          <p>{result.message || "We'll notify you once an admin reviews your application."}</p>
        </div>
        <button className="merchant-primary-button" type="button" onClick={() => navigate("/login")}>Back to sign in</button>
      </MerchantRegistrationShell>
    );
  }

  return <MerchantRegistrationShell eyebrow={`Merchant registration · Step ${step} of ${STEPS.length}`} title={STEPS[step - 1]} description="Simple Alpha onboarding for one merchant owner and their first store. Business permits remain conditional.">
    <ol className="merchant-registration-progress" aria-label="Merchant registration progress">
      {STEPS.map((label, index) => <li key={label} data-state={index + 1 === step ? "current" : index + 1 < step ? "complete" : "upcoming"}><span>{index + 1}</span><small>{label}</small></li>)}
    </ol>
    {previewMode ? <p className="merchant-contract-note"><strong>UI preview mode.</strong> Required fields are bypassed for navigation. Nothing is submitted.</p> : null}

    <form ref={formRef} className="merchant-auth-form merchant-registration-form" noValidate={previewMode} onSubmit={handleSubmit}>
      <fieldset data-step="1" hidden={step !== 1} disabled={step !== 1}>
        <div className="merchant-field-row"><Field label="First name"><input name="firstName" required autoComplete="given-name" /></Field><Field label="Last name"><input name="lastName" required autoComplete="family-name" /></Field></div>
        <div className="merchant-field-row"><Field label="Email"><input name="email" required type="email" autoComplete="email" /></Field><Field label="Mobile"><input name="mobile" required type="tel" autoComplete="tel" /></Field></div>
        <div className="merchant-field-row"><Field label="Password"><input required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field><Field label="Confirm password"><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field></div>
        <div className="merchant-password-meter" data-strength={strength.toLowerCase()}><span>Password strength</span><strong>{strength}</strong></div>
      </fieldset>

      <fieldset data-step="2" hidden={step !== 2} disabled={step !== 2}>
        <div className="merchant-verification-grid">
          <section><span>EMAIL VERIFICATION</span><h2>Verification code</h2><Field label="6-digit code"><input className="merchant-field__otp" inputMode="numeric" maxLength={6} placeholder="000000" value={otpCode} onChange={(event) => setOtpCode(event.target.value)} /></Field><button className="merchant-secondary-button" type="button" disabled={login.loading} onClick={() => { if (!previewMode) login.execute({ email: readStepFields(1).email ?? "", password }); }}>{login.loading ? "Sending…" : "Resend code"}</button></section>
          <section><span>MOBILE VERIFICATION</span><h2>Same code</h2><p className="merchant-contract-note">Xano uses one shared verification code for both channels -- enter the code from your email above, then verify.</p></section>
        </div>
        <button className="merchant-primary-button" type="button" disabled={verify.loading} onClick={verifyCode}>{verify.loading ? "Verifying…" : "Verify code"}</button>
      </fieldset>

      <fieldset data-step="3" hidden={step !== 3} disabled={step !== 3}>
        <div className="merchant-field-row"><Field label="Birthday"><input name="birthday" type="date" required /></Field><Field label="Gender"><select name="gender" required defaultValue=""><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></Field></div>
        <Field label="Profile photo"><input name="profilePhoto" type="file" accept="image/*" required /></Field>
        <div className="merchant-field-row"><Field label="Province"><input name="ownerProvince" required /></Field><Field label="City / Municipality"><input name="ownerCity" required /></Field></div>
        <div className="merchant-field-row"><Field label="Barangay"><input name="ownerBarangay" required /></Field><Field label="Residential address"><input name="ownerAddress" required /></Field></div>
        <p className="merchant-contract-note">Owner identity remains separate from Store identity. One Merchant account may manage multiple stores later. Profile photo isn't sent to Xano yet -- complete-onboarding's confirmed contract only takes ID front/back + selfie (see Step 5).</p>
      </fieldset>

      <fieldset data-step="4" hidden={step !== 4} disabled={step !== 4}>
        <div className="merchant-field-row"><Field label="Store name"><input name="storeName" required /></Field><Field label="Store contact number"><input name="storeContact" type="tel" required /></Field></div>
        <div className="merchant-field-row"><Field label="Category"><select name="storeCategory" required defaultValue=""><option value="" disabled>Select category</option><option>Sari-Sari</option><option>Hardware</option><option>Food</option><option>Pharmacy</option><option>Agri Business</option><option>Wet Market</option><option>Pet Shop</option><option>Other approved category</option></select></Field><Field label="Subcategory"><select name="storeSubcategory" defaultValue=""><option value="" disabled>Requires category API</option><option>General retail</option><option>Specialty store</option><option>Prepared food</option></select></Field></div>
        <div className="merchant-file-grid"><Field label="Store logo"><input name="storeLogo" type="file" accept="image/*" /></Field><Field label="Cover photo"><input name="storeCover" type="file" accept="image/*" required /></Field></div>
        <Field label="Store description"><textarea name="storeDescription" rows={3} required /></Field>
        <div className="merchant-location-actions"><button className="merchant-secondary-button" type="button" onClick={() => setApiNotice("Current location was not requested. Google Maps permission and Xano's location schema are required.")}>Use Current Location</button><button className="merchant-secondary-button" type="button" onClick={() => setApiNotice("Map selection is not live. Google Maps picker and authoritative coordinates are required.")}>Choose on Google Map</button></div>
        <div className="merchant-field-row"><Field label="Province"><input name="storeProvince" required /></Field><Field label="City / Municipality"><input name="storeCity" required /></Field></div>
        <div className="merchant-field-row"><Field label="Barangay"><input name="storeBarangay" required /></Field><Field label="Store address"><input name="storeAddress" required /></Field></div>
        <div className="merchant-store-hours-card"><div><span>OPERATING HOURS</span><h2>Main Store schedule</h2><p>Alpha uses one standard schedule. Special and holiday hours can follow later.</p></div><Field label="Store status"><select name="storeStatus" defaultValue="open"><option value="open">Open</option><option value="closed">Closed</option></select></Field></div>
        <div className="merchant-field-row"><Field label="Opening time"><input name="openingTime" type="time" required /></Field><Field label="Closing time"><input name="closingTime" type="time" required /></Field></div>
      </fieldset>

      <fieldset data-step="5" hidden={step !== 5} disabled={step !== 5}>
        <div className="merchant-field-row"><Field label="ID type"><select name="idType" required defaultValue=""><option value="" disabled>Select ID type</option><option>PhilSys ID</option><option>Driver's License</option><option>Passport</option><option>UMID</option><option>Other government ID</option></select></Field><Field label="ID number"><input name="idNumber" required /></Field></div>
        <div className="merchant-file-grid"><Field label="ID front"><input name="idFront" type="file" accept="image/*" required /></Field><Field label="ID back"><input name="idBack" type="file" accept="image/*" required /></Field><Field label="Selfie with ID"><input name="selfieWithId" type="file" accept="image/*" required /></Field></div>
        <div className="merchant-submission-path">{["Merchant registered", "OTP verified", "Store created", "Admin review", "Approved", "Store active"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}</div>
        <section className="merchant-alpha-scope"><span>CONDITIONAL BUSINESS VERIFICATION</span><h2>Small merchants are welcome</h2><p>Business documents are requested later only when required by merchant type, higher limits, POS, wholesale, supplier purchasing, or another activated capability.</p></section>
        <button className="merchant-primary-button" type="submit" disabled={!!uploadStage}>{uploadStage ?? "Submit for Admin Review"}</button>
      </fieldset>

      {register.error ? <p className="merchant-form-message is-error" role="alert">{register.error}</p> : null}
      {login.error ? <p className="merchant-form-message is-error" role="alert">{login.error}</p> : null}
      {verify.error ? <p className="merchant-form-message is-error" role="alert">{verify.error}</p> : null}
      {apiNotice ? <p className="merchant-form-message is-api-required" role="status">{apiNotice}</p> : null}
      {formError ? <p className="merchant-form-message is-error" role="alert">{formError}</p> : null}
      <div className="merchant-registration-actions">
        {step > 1 ? <button className="merchant-secondary-button" type="button" onClick={goBack}>Back</button> : <button className="merchant-text-button" type="button" onClick={() => navigate("/login")}>Back to sign in</button>}
        {step < STEPS.length && step !== 2 ? <button className="merchant-primary-button" type="button" disabled={register.loading || login.loading} onClick={() => continueTo(step + 1)}>{register.loading || login.loading ? "Please wait…" : "Next"}</button> : null}
      </div>
    </form>
  </MerchantRegistrationShell>;
}
