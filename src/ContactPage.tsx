import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import {
  buildContactMailto,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
  type RequestKind,
} from "./contactFormValidation";
import "./ContactPage.css";

const DEFAULT_MAILTO = "accessibility-lab@example.com";

function emptyForm(): ContactFormValues {
  return {
    requestKind: "",
    fullName: "",
    email: "",
    phone: "",
    projectName: "",
    projectManagerName: "",
    projectManagerEmail: "",
    description: "",
  };
}

export default function ContactPage() {
  const formId = useId();
  const [values, setValues] = useState<ContactFormValues>(() => emptyForm());
  const [errors, setErrors] = useState<ContactFormErrors>({});
  useEffect(() => {
    document.body.dataset.appView = "scroll";
    return () => {
      delete document.body.dataset.appView;
    };
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = "Contact — LIGHTNING A11Y LAB";
    return () => {
      document.title = prev;
    };
  }, []);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const next = validateContactForm(values);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const to = import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_MAILTO;
    const url = buildContactMailto(values, to);
    window.location.href = url;
  };

  const field = (key: keyof ContactFormValues) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${formId}-${String(key)}-err` : undefined,
  });

  return (
    <div className="cp">
      <MarketingHeader />
      <main id="top" className="cp-main" tabIndex={-1}>
        <section className="cp-banner" aria-labelledby="cp-banner-title">
          <img
            className="cp-banner-photo"
            src={`${import.meta.env.BASE_URL}contact-header.png`}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
          />
          <div className="cp-banner-scrim" aria-hidden="true" />
          <div className="cp-banner-inner">
            <nav className="cp-masthead-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true"> / </span>
              <span className="cp-masthead-breadcrumb-current">Contact</span>
            </nav>
            <p id="cp-banner-title" className="cp-banner-title">
              We typically reply within one business day
            </p>
            <p className="cp-banner-text">
              Use this form for training requests, tool support, or program questions. Your message opens in your email
              client so you can add attachments before sending.
            </p>
          </div>
        </section>

        <div className="cp-wrap">
          <header className="cp-hero">
            <h1 className="cp-title">Contact us</h1>
            <p className="cp-lead">
              Request <strong>accessibility training</strong>, <strong>tool walkthrough &amp; support</strong>, or ask
              a question about your Lightning accessibility program. Fields marked <span className="cp-req">*</span>{" "}
              are required.
            </p>
          </header>

          <form className="cp-form" onSubmit={onSubmit} noValidate>
            <fieldset className="cp-fieldset">
              <legend className="cp-legend">What do you need? *</legend>
              <div className="cp-radio-row">
                <label className="cp-radio">
                  <input
                    type="radio"
                    name="requestKind"
                    value="training"
                    checked={values.requestKind === "training"}
                    onChange={() => setValues((v) => ({ ...v, requestKind: "training" as RequestKind }))}
                  />
                  <span>Accessibility training</span>
                </label>
                <label className="cp-radio">
                  <input
                    type="radio"
                    name="requestKind"
                    value="tool-support"
                    checked={values.requestKind === "tool-support"}
                    onChange={() => setValues((v) => ({ ...v, requestKind: "tool-support" as RequestKind }))}
                  />
                  <span>Tool explain &amp; support</span>
                </label>
              </div>
              {errors.requestKind && (
                <p id={`${formId}-requestKind-err`} className="cp-error" role="alert">
                  {errors.requestKind}
                </p>
              )}
            </fieldset>

            <div className="cp-grid">
              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-name`}>
                  Your full name *
                </label>
                <input
                  id={`${formId}-name`}
                  className="cp-input"
                  type="text"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
                  {...field("fullName")}
                />
                {errors.fullName && (
                  <p id={`${formId}-fullName-err`} className="cp-error" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-email`}>
                  Your email *
                </label>
                <input
                  id={`${formId}-email`}
                  className="cp-input"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  {...field("email")}
                />
                {errors.email && (
                  <p id={`${formId}-email-err`} className="cp-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-phone`}>
                  Phone number *
                </label>
                <input
                  id={`${formId}-phone`}
                  className="cp-input"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 010 0199"
                  value={values.phone}
                  onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                  {...field("phone")}
                />
                {errors.phone && (
                  <p id={`${formId}-phone-err`} className="cp-error" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-project`}>
                  Project name *
                </label>
                <input
                  id={`${formId}-project`}
                  className="cp-input"
                  type="text"
                  value={values.projectName}
                  onChange={(e) => setValues((v) => ({ ...v, projectName: e.target.value }))}
                  {...field("projectName")}
                />
                {errors.projectName && (
                  <p id={`${formId}-projectName-err`} className="cp-error" role="alert">
                    {errors.projectName}
                  </p>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-pm-name`}>
                  Project manager name *
                </label>
                <input
                  id={`${formId}-pm-name`}
                  className="cp-input"
                  type="text"
                  autoComplete="name"
                  value={values.projectManagerName}
                  onChange={(e) => setValues((v) => ({ ...v, projectManagerName: e.target.value }))}
                  {...field("projectManagerName")}
                />
                {errors.projectManagerName && (
                  <p id={`${formId}-projectManagerName-err`} className="cp-error" role="alert">
                    {errors.projectManagerName}
                  </p>
                )}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor={`${formId}-pm-email`}>
                  Project manager email *
                </label>
                <input
                  id={`${formId}-pm-email`}
                  className="cp-input"
                  type="email"
                  autoComplete="email"
                  value={values.projectManagerEmail}
                  onChange={(e) => setValues((v) => ({ ...v, projectManagerEmail: e.target.value }))}
                  {...field("projectManagerEmail")}
                />
                {errors.projectManagerEmail && (
                  <p id={`${formId}-projectManagerEmail-err`} className="cp-error" role="alert">
                    {errors.projectManagerEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="cp-field cp-field--full">
              <label className="cp-label" htmlFor={`${formId}-desc`}>
                Description / how we can help *
              </label>
              <textarea
                id={`${formId}-desc`}
                className="cp-textarea"
                rows={6}
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                {...field("description")}
              />
              {errors.description && (
                <p id={`${formId}-description-err`} className="cp-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            <p className="cp-note">
              Submitting opens your email app with a pre-filled message to{" "}
              <strong>{import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_MAILTO}</strong>. Set{" "}
              <code className="cp-code">VITE_CONTACT_EMAIL</code> at build time to change the address.
            </p>

            <div className="cp-actions">
              <button type="submit" className="cp-btn cp-btn-primary">
                Submit request
              </button>
              <Link to="/" className="cp-btn cp-btn-ghost">
                Back to home
              </Link>
            </div>

          </form>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
